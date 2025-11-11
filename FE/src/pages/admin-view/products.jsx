import { Fragment, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import AdminProductTile from "@/components/admin-view/product-tile";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import CommonForm from "@/components/common/form";
import { addProductFormElements } from "@/config";
import ProductImageUpload from "@/components/admin-view/image-upload";
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
  size: "",
  color: "",
  price: "",
  salePrice: "",
  totalStock: "",
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

  function onSubmit(event) {
    event.preventDefault();

    currentEditedId !== null
      ? dispatch(
          editProduct({
            id: currentEditedId,
            formData,
          })
        ).then((data) => {
          console.log(data, "edit");

          if (data?.payload?.success) {
            dispatch(fetchAllProducts());
            setFormData(initialFormData);
            setOpenCreateProductsDialog(false);
            setCurrentEditedId(null);
          }
        })
      : dispatch(
          addNewProduct({
            ...formData,
            image: uploadedImageUrl,
          })
        ).then((data) => {
          if (data?.payload?.success) {
            dispatch(fetchAllProducts());
            setOpenCreateProductsDialog(false);
            setImageFile(null);
            setFormData(initialFormData);
            toast({
              title: "Product add successfully",
            });
          }
        });
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
    return Object.keys(formData)
      .filter((currentKey) => currentKey !== "averageReview" && currentKey !== "discountAfterSeason")
      .map((key) => formData[key] !== "")
      .every((item) => item);
  }

  useEffect(() => {
    dispatch(fetchAllProducts());
    // Fetch options
    dispatch(fetchOptions("category"));
    dispatch(fetchOptions("brand"));
    dispatch(fetchOptions("size"));
    dispatch(fetchOptions("color"));
  }, [dispatch]);

  // Create dynamic form elements with options from API
  const dynamicFormElements = useMemo(() => {
    return addProductFormElements.map((element) => {
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
      if (element.name === "size" && sizes.length > 0) {
        return {
          ...element,
          options: sizes.map((size) => ({
            id: size.name,
            label: size.label,
          })),
        };
      }
      if (element.name === "color" && colors.length > 0) {
        return {
          ...element,
          options: colors.map((color) => ({
            id: color.name,
            label: color.label,
          })),
        };
      }
      return element;
    });
  }, [categories, brands, sizes, colors]);

  // Reset về trang 1 khi productList thay đổi
  useEffect(() => {
    setCurrentPage(1);
  }, [productList?.length]);

  console.log(productList, "productList");

  return (
    <Fragment>
      <div className="mb-5 flex justify-end">
        <Button onClick={() => setOpenCreateProductsDialog(true)}>
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
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
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
            <CommonForm
              onSubmit={onSubmit}
              formData={formData}
              setFormData={setFormData}
              buttonText={currentEditedId !== null ? "Edit" : "Add"}
              formControls={dynamicFormElements}
              isBtnDisabled={!isFormValid()}
            />
          </div>
        </SheetContent>
      </Sheet>
    </Fragment>
  );
}

export default AdminProducts;
