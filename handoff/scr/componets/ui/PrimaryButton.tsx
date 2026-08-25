import { Button, type ButtonProps } from "./Button";

/** Compatibilidade: mesma API anterior, visual da referência. */
export function PrimaryButton(props: Omit<ButtonProps, "variant">) {
  return <Button variant="primary" {...props} />;
}
