import { StarIcon } from "lucide-react";
import { Button } from "../ui/button";

function StarRatingComponent({ rating, handleRatingChange }) {
  console.log(rating, "rating");

  return [1, 2, 3, 4, 5].map((star) => (
    <Button
      variant="ghost"
      size="icon"
      className={`p-2 hover:bg-transparent ${
        star <= rating ? "text-yellow-500" : ""
      }`}
      onClick={handleRatingChange ? () => handleRatingChange(star) : null}
    >
      <StarIcon
        className={`w-4 h-4 ${
          star <= rating ? "fill-yellow-500" : "fill-white"
        }`}
      />
    </Button>
  ));
}

export default StarRatingComponent;
