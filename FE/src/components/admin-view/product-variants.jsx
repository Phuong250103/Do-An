import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { X, Plus } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function ProductVariants({ variants, setVariants, sizes, colors }) {
  const [localVariants, setLocalVariants] = useState(
    variants && variants.length > 0
      ? variants.map((v) => ({
          color: v.color || "",
          size: v.size || "",
          quantity: v.quantity || 0,
        }))
      : [{ color: "", size: "", quantity: 0 }]
  );

  const isUpdatingFromProps = useRef(false);
  const prevVariantsRef = useRef(variants);

  useEffect(() => {
    // Chỉ cập nhật từ props nếu props thực sự thay đổi từ bên ngoài (không phải do chính component này trigger)
    if (isUpdatingFromProps.current) {
      isUpdatingFromProps.current = false;
      return;
    }

    // So sánh với variants trước đó
    const prevVariantsString = JSON.stringify(prevVariantsRef.current || []);
    const currentVariantsString = JSON.stringify(variants || []);

    if (prevVariantsString !== currentVariantsString) {
      prevVariantsRef.current = variants;

      if (variants && variants.length > 0) {
        setLocalVariants(
          variants.map((v) => ({
            color: v.color || "",
            size: v.size || "",
            quantity: v.quantity || 0,
          }))
        );
      }
    }
  }, [variants]);

  useEffect(() => {
    // Cập nhật parent component khi localVariants thay đổi
    // Chỉ gửi các variant hợp lệ
    const validVariants = localVariants.filter(
      (v) => v.color && v.size && v.quantity > 0
    );

    // So sánh với variants hiện tại từ props để tránh cập nhật không cần thiết
    const currentVariantsString = JSON.stringify(validVariants);
    const propsVariantsString = JSON.stringify(variants || []);

    if (currentVariantsString !== propsVariantsString) {
      isUpdatingFromProps.current = true;
      setVariants(validVariants);
    }
  }, [localVariants]);

  const addVariant = () => {
    setLocalVariants([...localVariants, { color: "", size: "", quantity: 0 }]);
  };

  const removeVariant = (index) => {
    if (localVariants.length > 1) {
      const newVariants = localVariants.filter((_, i) => i !== index);
      setLocalVariants(newVariants);
    }
  };

  const updateVariant = (index, field, value) => {
    const newVariants = [...localVariants];
    newVariants[index] = {
      ...newVariants[index],
      [field]: value,
    };
    setLocalVariants(newVariants);
  };

  const getSizeLabel = (sizeName) => {
    const sizeOption = sizes.find((s) => s.name === sizeName);
    return sizeOption ? sizeOption.label : sizeName;
  };

  const getColorLabel = (colorName) => {
    const colorOption = colors.find((c) => c.name === colorName);
    return colorOption ? colorOption.label : colorName;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-base font-semibold">Product variations</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addVariant}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Variant
        </Button>
      </div>

      <div className="space-y-3">
        {localVariants.map((variant, index) => (
          <div
            key={`variant-${index}-${variant.color}-${variant.size}`}
            className="flex items-end gap-2 p-3 border rounded-md bg-muted/30"
          >
            <div className="flex-1">
              <Label className="text-sm">Color</Label>
              <Select
                value={variant.color}
                onValueChange={(value) => updateVariant(index, "color", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Color" />
                </SelectTrigger>
                <SelectContent>
                  {colors && colors.length > 0 ? (
                    colors.map((color) => (
                      <SelectItem key={color.name} value={color.name}>
                        <div className="flex items-center gap-2">
                          <span
                            className="w-4 h-4 rounded-xl border"
                            style={{ backgroundColor: color.code }}
                          ></span>
                          {color.label}
                        </div>
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="" disabled>
                      Đang tải...
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1">
              <Label className="text-sm">Size</Label>
              <Select
                value={variant.size}
                onValueChange={(value) => updateVariant(index, "size", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose Size" />
                </SelectTrigger>
                <SelectContent>
                  {sizes && sizes.length > 0 ? (
                    sizes.map((size) => (
                      <SelectItem key={size.name} value={size.name}>
                        {size.label}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="" disabled>
                      Đang tải...
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="w-20">
              <Label className="text-sm">Quantity</Label>
              <Input
                type="number"
                min="0"
                value={variant.quantity}
                onChange={(e) =>
                  updateVariant(
                    index,
                    "quantity",
                    parseInt(e.target.value) || 0
                  )
                }
                placeholder="0"
              />
            </div>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeVariant(index)}
              disabled={localVariants.length === 1}
              className="mb-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      {localVariants.length > 0 && (
        <div className="text-sm text-muted-foreground">
          Total:{" "}
          <span className="font-semibold">
            {localVariants.reduce(
              (sum, v) => sum + (parseInt(v.quantity) || 0),
              0
            )}
          </span>
        </div>
      )}
    </div>
  );
}

export default ProductVariants;
