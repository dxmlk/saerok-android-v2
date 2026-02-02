import { Text, TextInput } from "react-native";
import { font } from "./typography";

export function applyDefaultTypography() {
  // Text
  const TextRender = (Text as any).render;
  if (!(Text as any).__patched) {
    (Text as any).__patched = true;
    (Text as any).render = function (...args: any[]) {
      const origin = TextRender.call(this, ...args);
      return {
        ...origin,
        props: {
          ...origin.props,
          style: [{ fontFamily: font.regular }, origin.props.style],
        },
      };
    };
  }

  // TextInput
  const TextInputRender = (TextInput as any).render;
  if (!(TextInput as any).__patched) {
    (TextInput as any).__patched = true;
    (TextInput as any).render = function (...args: any[]) {
      const origin = TextInputRender.call(this, ...args);
      return {
        ...origin,
        props: {
          ...origin.props,
          style: [{ fontFamily: font.regular }, origin.props.style],
        },
      };
    };
  }
}
