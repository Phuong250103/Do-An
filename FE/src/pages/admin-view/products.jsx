import { Fragment, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import AdminProductTile from "@/components/admin-view/product-tile";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { addProductFormElements } from "@/config";
import ProductImageUpload from "@/components/admin-view/image-upload";
import ProductVariants from "@/components/admin-view/product-variants";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDispatch, useSelector } from "react-redux";
import {
  addNewProduct,
  deleteProduct,
  editProduct,
  fetchAllProducts,
} from "@/store/admin/products-slice";
import { fetchOptions } from "@/store/admin/options-slice";
import { toast } from "@/hooks/use-toast";
import { useMemo } from "react";

const initialFormData = {
  image: null,
  title: "",
  description: "",
  category: "",
  brand: "",
  price: "",
  salePrice: "",
  averageReview: 0,
  season: "",
  discountAfterSeason: "",
};

function AdminProducts() {
  const [openCreateProductsDialog, setOpenCreateProductsDialog] =
    useState(false);
  const [formData, setFormData] = useState(initialFormData);
  const [currentEditedId, setCurrentEditedId] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");
  const [imageLoadingState, setImageLoadingState] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [variants, setVariants] = useState([]);
  const [colorImages, setColorImages] = useState({});
  const { productList } = useSelector((state) => state.adminProducts);
  const { categories, brands, sizes, colors } = useSelector(
    (state) => state.adminOptions
  );
  const dispatch = useDispatch();

  const itemsPerPage = 8;
  const totalPages = Math.ceil((productList?.length || 0) / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = productList?.slice(startIndex, endIndex) || [];

  async function onSubmit(event) {
    event.preventDefault();

    try {
      if (currentEditedId !== null) {
        await dispatch(
          editProduct({
            id: currentEditedId,
            formData: {
              ...formData,
              variants,
              colorImages,
            },
          })
        ).unwrap();

        toast({ title: "Product updated successfully" });
      } else {
        await dispatch(
          addNewProduct({
            ...formData,
            image: uploadedImageUrl,
            variants,
            colorImages,
          })
        ).unwrap();

        toast({ title: "Product added successfully" });
      }
      dispatch(fetchAllProducts());
      setOpenCreateProductsDialog(false);
      setFormData(initialFormData);
      setVariants([]);
      setColorImages({});
      setCurrentEditedId(null);
      setImageFile(null);
    } catch (error) {
      toast({
        description: error?.message || "Something went wrong",
        variant: "destructive",
      });
    }
  }

  function handleDelete(getCurrentProductId) {
    const isConfirmed = window.confirm(
      "Are you sure you want to delete this product?"
    );
    if (!isConfirmed) return;

    dispatch(deleteProduct(getCurrentProductId)).then((data) => {
      if (data?.payload?.success) {
        dispatch(fetchAllProducts());
      }
    });
  }

  function isFormValid() {
    // Kiểm tra các trường bắt buộc
    const requiredFields = [
      "title",
      "description",
      "category",
      "brand",
      "price",
      "season",
    ];
    const isFormFieldsValid = requiredFields
      .map((key) => formData[key] !== "")
      .every((item) => item);

    // Kiểm tra variants phải có ít nhất 1 biến thể hợp lệ
    const hasValidVariants =
      variants &&
      variants.length > 0 &&
      variants.some((v) => v.color && v.size && v.quantity > 0);

    return isFormFieldsValid && hasValidVariants;
  }

  useEffect(() => {
    dispatch(fetchAllProducts());
    // Fetch options
    dispatch(fetchOptions("category"));
    dispatch(fetchOptions("brand"));
    dispatch(fetchOptions("size"));
    dispatch(fetchOptions("color"));
  }, [dispatch]);

  // Tách form elements thành 2 phần: trước Price và từ Price trở đi
  const formElementsBeforePrice = useMemo(() => {
    return addProductFormElements
      .filter(
        (element) =>
          element.name !== "price" &&
          element.name !== "salePrice" &&
          element.name !== "season" &&
          element.name !== "discountAfterSeason"
      )
      .map((element) => {
        if (element.name === "category" && categories.length > 0) {
          return {
            ...element,
            options: categories.map((cat) => ({
              id: cat.name,
              label: cat.label,
            })),
          };
        }
        if (element.name === "brand" && brands.length > 0) {
          return {
            ...element,
            options: brands.map((brand) => ({
              id: brand.name,
              label: brand.label,
            })),
          };
        }
        return element;
      });
  }, [categories, brands]);

  const formElementsFromPrice = useMemo(() => {
    return addProductFormElements
      .filter(
        (element) =>
          element.name === "price" ||
          element.name === "salePrice" ||
          element.name === "season" ||
          element.name === "discountAfterSeason"
      )
      .map((element) => {
        if (element.name === "category" && categories.length > 0) {
          return {
            ...element,
            options: categories.map((cat) => ({
              id: cat.name,
              label: cat.label,
            })),
          };
        }
        if (element.name === "brand" && brands.length > 0) {
          return {
            ...element,
            options: brands.map((brand) => ({
              id: brand.name,
              label: brand.label,
            })),
          };
        }
        return element;
      });
  }, [categories, brands]);

  // Reset về trang 1 khi productList thay đổi
  useEffect(() => {
    setCurrentPage(1);
  }, [productList?.length]);

  console.log(productList, "productList");

  return (
    <Fragment>
      <div className="mb-5 flex justify-end">
        <Button
          onClick={() => {
            setOpenCreateProductsDialog(true);
            setFormData(initialFormData);
            setUploadedImageUrl("");
            setImageFile(null);
            setVariants([]);
            setColorImages({});
          }}
        >
          Add New Product
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
        {currentProducts && currentProducts.length > 0
          ? currentProducts.map((productItem) => (
              <AdminProductTile
                key={productItem._id}
                setFormData={setFormData}
                setOpenCreateProductsDialog={setOpenCreateProductsDialog}
                setCurrentEditedId={setCurrentEditedId}
                product={productItem}
                handleDelete={handleDelete}
                setVariants={setVariants}
                setColorImages={setColorImages}
                setUploadedImageUrl={setUploadedImageUrl}
              />
            ))
          : null}
      </div>
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                onClick={() => setCurrentPage(page)}
                className="min-w-[40px]"
              >
                {page}
              </Button>
            ))}
          </div>
          <Button
            variant="outline"
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}
      <Sheet
        open={openCreateProductsDialog}
        onOpenChange={() => {
          setOpenCreateProductsDialog(false);
          setCurrentEditedId(null);
          setFormData(initialFormData);
          setVariants([]);
          setColorImages({});
        }}
      >
        <SheetContent side="right" className="overflow-auto">
          <SheetHeader>
            <SheetTitle>
              {currentEditedId !== null ? "Edit Product" : "Add New Product"}
            </SheetTitle>
          </SheetHeader>
          <ProductImageUpload
            imageFile={imageFile}
            setImageFile={setImageFile}
            uploadedImageUrl={uploadedImageUrl}
            setUploadedImageUrl={setUploadedImageUrl}
            setImageLoadingState={setImageLoadingState}
            imageLoadingState={imageLoadingState}
            isEditMode={currentEditedId !== null}
          />
          <div className="py-6">
            <form onSubmit={onSubmit}>
              <div className="flex flex-col gap-3">
                {formElementsBeforePrice.map((controlItem) => {
                  const value = formData[controlItem.name] || "";
                  let element = null;

                  switch (controlItem.componentType) {
                    case "input":
                      element = (
                        <Input
                          name={controlItem.name}
                          placeholder={controlItem.placeholder}
                          id={controlItem.name}
                          type={controlItem.type}
                          value={value}
                          onChange={(event) =>
                            setFormData({
                              ...formData,
                              [controlItem.name]: event.target.value,
                            })
                          }
                        />
                      );
                      break;
                    case "select":
                      element = (
                        <Select
                          onValueChange={(value) =>
                            setFormData({
                              ...formData,
                              [controlItem.name]: value,
                            })
                          }
                          value={value}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder={controlItem.label} />
                          </SelectTrigger>
                          <SelectContent>
                            {controlItem.options &&
                            controlItem.options.length > 0
                              ? controlItem.options.map((optionItem) => (
                                  <SelectItem
                                    key={optionItem.id}
                                    value={optionItem.id}
                                  >
                                    {optionItem.label}
                                  </SelectItem>
                                ))
                              : null}
                          </SelectContent>
                        </Select>
                      );
                      break;
                    case "textarea":
                      element = (
                        <Textarea
                          name={controlItem.name}
                          placeholder={controlItem.placeholder}
                          id={controlItem.name}
                          value={value}
                          onChange={(event) =>
                            setFormData({
                              ...formData,
                              [controlItem.name]: event.target.value,
                            })
                          }
                        />
                      );
                      break;
                    default:
                      element = (
                        <Input
                          name={controlItem.name}
                          placeholder={controlItem.placeholder}
                          id={controlItem.name}
                          type={controlItem.type}
                          value={value}
                          onChange={(event) =>
                            setFormData({
                              ...formData,
                              [controlItem.name]: event.target.value,
                            })
                          }
                        />
                      );
                  }

                  return (
                    <div className="grid w-full gap-1.5" key={controlItem.name}>
                      <Label className="mb-1">{controlItem.label}</Label>
                      {element}
                    </div>
                  );
                })}
              </div>

              {/* Phần Variants */}
              <div className="mt-6 pt-6 border-t">
                <ProductVariants
                  variants={variants}
                  setVariants={setVariants}
                  sizes={sizes}
                  colors={colors}
                  colorImages={colorImages}
                  setColorImages={setColorImages}
                />
              </div>

              <div className="mt-6 flex flex-col gap-3">
                {formElementsFromPrice.map((controlItem) => {
                  const value = formData[controlItem.name] || "";
                  let element = null;

                  switch (controlItem.componentType) {
                    case "input":
                      element = (
                        <Input
                          name={controlItem.name}
                          placeholder={controlItem.placeholder}
                          id={controlItem.name}
                          type={controlItem.type}
                          value={value}
                          onChange={(event) =>
                            setFormData({
                              ...formData,
                              [controlItem.name]: event.target.value,
                            })
                          }
                        />
                      );
                      break;
                    case "select":
                      element = (
                        <Select
                          onValueChange={(value) =>
                            setFormData({
                              ...formData,
                              [controlItem.name]: value,
                            })
                          }
                          value={value}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder={controlItem.label} />
                          </SelectTrigger>
                          <SelectContent>
                            {controlItem.options &&
                            controlItem.options.length > 0
                              ? controlItem.options.map((optionItem) => (
                                  <SelectItem
                                    key={optionItem.id}
                                    value={optionItem.id}
                                  >
                                    {optionItem.label}
                                  </SelectItem>
                                ))
                              : null}
                          </SelectContent>
                        </Select>
                      );
                      break;
                    case "textarea":
                      element = (
                        <Textarea
                          name={controlItem.name}
                          placeholder={controlItem.placeholder}
                          id={controlItem.name}
                          value={value}
                          onChange={(event) =>
                            setFormData({
                              ...formData,
                              [controlItem.name]: event.target.value,
                            })
                          }
                        />
                      );
                      break;
                    default:
                      element = (
                        <Input
                          name={controlItem.name}
                          placeholder={controlItem.placeholder}
                          id={controlItem.name}
                          type={controlItem.type}
                          value={value}
                          onChange={(event) =>
                            setFormData({
                              ...formData,
                              [controlItem.name]: event.target.value,
                            })
                          }
                        />
                      );
                  }

                  return (
                    <div className="grid w-full gap-1.5" key={controlItem.name}>
                      <Label className="mb-1">{controlItem.label}</Label>
                      {element}
                    </div>
                  );
                })}
              </div>

              <Button
                disabled={!isFormValid()}
                type="submit"
                className="mt-6 w-full"
              >
                {currentEditedId !== null ? "Edit" : "Add"}
              </Button>
            </form>
          </div>
        </SheetContent>
      </Sheet>
    </Fragment>
  );
}

export default AdminProducts;
