interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
}

export default function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <div className="w-12 h-12 bg-primary-light/20 rounded-full flex items-center justify-center mb-4">
        <i className={`${icon} text-xl text-primary`}></i>
      </div>
      <h3 className="font-semibold mb-2">{title}</h3>
      <p className="text-sm text-neutral-600">{description}</p>
    </div>
  );
}
