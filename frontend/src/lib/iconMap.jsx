import {
  ShieldCheck,
  Truck,
  BadgeIndianRupee,
  Headset,
  Sprout,
  BadgeCheck,
  Warehouse,
  Package,
  Star,
} from 'lucide-react';

const map = {
  shield: ShieldCheck,
  truck: Truck,
  tag: BadgeIndianRupee,
  headset: Headset,
  sprout: Sprout,
  check: BadgeCheck,
  warehouse: Warehouse,
  package: Package,
  star: Star,
};

export default function Icon({ name, ...props }) {
  const Cmp = map[name] || Star;
  return <Cmp {...props} />;
}
