import Category from "~/components/Category/category";

export default function CategoryPage(props: {
  params: { category: string; subcategory: string };
}) {
  return (
    <div>
      <Category
        category={props.params.category}
        subcategory={props.params.subcategory}
      />
    </div>
  )
}
