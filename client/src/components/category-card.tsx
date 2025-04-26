import { Button } from "@/components/ui/button";

interface CategoryCardProps {
  category: {
    id: number;
    name: string;
    icon: string;
  };
  onClick: () => void;
  isActive?: boolean;
}

export default function CategoryCard({ category, onClick, isActive = false }: CategoryCardProps) {
  // Map icon names to JSX elements
  const getIcon = (iconName: string) => {
    // Using Remix Icon classes
    return <i className={`${iconName} text-xl text-primary`}></i>;
  };

  return (
    <Button
      variant="ghost"
      className={`bg-white rounded-xl p-4 text-center shadow-sm hover:shadow-md transition-shadow duration-300 h-auto flex flex-col items-center w-full ${
        isActive ? 'ring-2 ring-primary' : ''
      }`}
      onClick={onClick}
    >
      <div className="w-12 h-12 bg-primary-light/20 rounded-full flex items-center justify-center mx-auto mb-3">
        {getIcon(category.icon)}
      </div>
      <h3 className="font-medium text-sm">{category.name}</h3>
    </Button>
  );
}
