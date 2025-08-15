type Props = { text: string };
export default function StatusStrip({ text }: Props) {
  return <div className="text-xs text-gray-600">{text}</div>;
}
