import { Fragment, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchOptions,
  addOption,
  editOption,
  deleteOption,
} from "@/store/admin/options-slice";
import { toast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const optionTypes = [
  { id: "category", label: "Categories" },
  { id: "brand", label: "Brands" },
  { id: "size", label: "Sizes" },
  { id: "color", label: "Colors" },
];

function AdminOptions() {
  const [selectedType, setSelectedType] = useState("category");
  const [openDialog, setOpenDialog] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({ name: "", label: "", code: "" });
  const dispatch = useDispatch();
  const { categories, brands, sizes, colors } = useSelector(
    (state) => state.adminOptions
  );

  const getCurrentOptions = () => {
    switch (selectedType) {
      case "category":
        return categories;
      case "brand":
        return brands;
      case "size":
        return sizes;
      case "color":
        return colors;
      default:
        return [];
    }
  };

  useEffect(() => {
    optionTypes.forEach((type) => {
      dispatch(fetchOptions(type.id));
    });
  }, [dispatch]);

  const handleAdd = () => {
    setEditingItem(null);
    setFormData({ name: "", label: "", code: "" });
    setOpenDialog(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({ name: item.name, label: item.label, code: item.code });
    setOpenDialog(true);
  };

  const handleDelete = (id) => {
    const isConfirmed = window.confirm(
      "Are you sure you want to delete this item?"
    );
    if (!isConfirmed) return;

    dispatch(deleteOption({ type: selectedType, id })).then((data) => {
      if (data?.payload) {
        toast({
          title: "Item deleted successfully",
        });
        dispatch(fetchOptions(selectedType));
      }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log("=== SUBMIT CLICKED ===");
    console.log("Selected Type:", selectedType);
    console.log("Form Data:", formData);

    if (!formData.name || !formData.label) {
      toast({
        title: "Error",
        description: "Name and label are required",
        variant: "destructive",
      });
      return;
    }

    const payload = {
      type: selectedType,
      name: formData.name,
      label: formData.label,
    };

    if (selectedType === "color") {
      payload.code = formData.code;
    }

    console.log("Payload will send:", payload);

    if (editingItem) {
      dispatch(editOption({ ...payload, id: editingItem._id })).then((data) => {
        if (data?.payload) {
          toast({ title: "Item updated successfully" });
          setOpenDialog(false);
          dispatch(fetchOptions(selectedType));
        }
      });
    } else {
      dispatch(addOption(payload)).then((data) => {
        if (data?.payload) {
          toast({ title: "Item added successfully" });
          setOpenDialog(false);
          setFormData({ name: "", label: "", code: "" });
          dispatch(fetchOptions(selectedType));
        }
      });
    }
  };

  const currentOptions = getCurrentOptions();

  return (
    <Fragment>
      <div className="mb-5 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Manage Options</h1>
        <Button onClick={handleAdd}>Add New</Button>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        {optionTypes.map((type) => (
          <Button
            key={type.id}
            variant={selectedType === type.id ? "default" : "outline"}
            onClick={() => setSelectedType(type.id)}
          >
            {type.label}
          </Button>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {optionTypes.find((t) => t.id === selectedType)?.label}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {currentOptions && currentOptions.length > 0 ? (
              currentOptions.map((item) => (
                <div
                  key={item._id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <p className="font-semibold">{item.label}</p>
                    <p className="text-sm text-muted-foreground">{item.name}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(item)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(item._id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground">No items found</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Sheet open={openDialog} onOpenChange={setOpenDialog}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>
              {editingItem ? "Edit" : "Add"} {selectedType}
            </SheetTitle>
          </SheetHeader>
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <Label htmlFor="name">Name (ID)</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Enter name"
              />
            </div>
            <div>
              <Label htmlFor="label">Label (Display Name)</Label>
              <Input
                id="label"
                value={formData.label}
                onChange={(e) =>
                  setFormData({ ...formData, label: e.target.value })
                }
                placeholder="Enter label"
              />
            </div>
            {selectedType === "color" && (
              <div>
                <Label htmlFor="code">Color Code</Label>
                <Input
                  id="code"
                  type="color"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value })
                  }
                  className="w-16 h-10 p-1"
                />
              </div>
            )}
            <div className="flex gap-2">
              <Button type="submit">{editingItem ? "Update" : "Add"}</Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpenDialog(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </Fragment>
  );
}

export default AdminOptions;
