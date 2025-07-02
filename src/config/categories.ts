import {
  Laptop, Monitor, Gamepad,
  Guitar, Piano, Drum,
  Paintbrush, Smile, Scissors,
  Puzzle, Shirt, Package
} from "lucide-react"

export const CATEGORIES = [
  {
    category: "Technic",
    items: [
      { name: "Laptops", icon: Laptop },
      { name: "Computers", icon: Monitor },
      { name: "Game Consoles", icon: Gamepad }
    ]
  },
  {
    category: "Music",
    items: [
      { name: "Guitars", icon: Guitar },
      { name: "Pianos", icon: Piano },
      { name: "Drums", icon: Drum }
    ]
  },
  {
       category: "Beauty and Fashion",
       items: [
         { name: "Makeup", icon: Paintbrush },
         { name: "Skincare", icon: Smile },
         { name: "Hair Products", icon: Scissors },
       ],
     },
     {
       category: "Children's Products",
       items: [
         { name: "Toys", icon: Puzzle },
         { name: "Clothing", icon: Shirt },
         { name: "Accessories", icon: Package },
       ],
     },
]