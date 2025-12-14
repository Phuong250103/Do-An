import { filterOptions } from "@/config";
import { Fragment, useState, useEffect } from "react";
import { Label } from "../ui/label";
import { Checkbox } from "../ui/checkbox";
import { Separator } from "../ui/separator";
import { useDispatch } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { fetchAllFilteredProducts } from "@/store/shop/products-slice";

function ProductFilter({}) {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedFilters, setSelectedFilters] = useState({
    category: [],
    brand: [],
  });

  // Sync with URL params when component mounts or URL changes
  useEffect(() => {
    const categoryParam = searchParams.get("category");
    const brandParam = searchParams.get("brand");

    setSelectedFilters({
      category: categoryParam ? categoryParam.split(",") : [],
      brand: brandParam ? brandParam.split(",") : [],
    });
  }, [searchParams]);

  const handleFilterChange = (filterName, filterValue) => {
    setSelectedFilters((prev) => {
      const updated = { ...prev };
      const index = updated[filterName].indexOf(filterValue);

      if (index === -1) {
        updated[filterName].push(filterValue);
      } else {
        updated[filterName].splice(index, 1);
      }

      // Update URL params
      const newParams = new URLSearchParams();
      if (updated.category.length > 0) {
        newParams.set("category", updated.category.join(","));
      }
      if (updated.brand.length > 0) {
        newParams.set("brand", updated.brand.join(","));
      }
      setSearchParams(newParams);

      // Gửi request lọc
      dispatch(fetchAllFilteredProducts(newParams.toString()));

      return updated;
    });
  };

  return (
    <div className="bg-background rounded-lg shadow-sm mt-2">
      <div className="p-4 border-b">
        <h2 className="text-lg font-extrabold">Filters</h2>
      </div>
      <div className="p-4 space-y-4">
        {Object.keys(filterOptions).map((keyItem) => (
          <Fragment key={keyItem}>
            <div>
              <h3 className="text-base font-bold capitalize">{keyItem}</h3>
              <div className="grid gap-2 mt-2">
                {filterOptions[keyItem].map((option) => (
                  <Label
                    key={option.id}
                    className="flex font-medium items-center gap-2 cursor-pointer"
                  >
                    <Checkbox
                      checked={selectedFilters[keyItem].includes(option.id)}
                      onCheckedChange={() =>
                        handleFilterChange(keyItem, option.id)
                      }
                    />
                    {option.label}
                  </Label>
                ))}
              </div>
            </div>
            <Separator />
          </Fragment>
        ))}
      </div>
    </div>
  );
}

export default ProductFilter;
