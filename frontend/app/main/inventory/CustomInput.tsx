import { Control, FieldValues, Path } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../../components/ui/form";
import { Input } from "../../../components/ui/input";

interface CustomInputProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label: string;
  placeholder: string;
  type?: string;
}

const CustomInput = <T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  type = "text",
}: CustomInputProps<T>) => {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="dark:text-white">{label}</FormLabel>
          <FormControl>
            <Input
              placeholder={placeholder}
              type={type}
              {...field}
              value={
                type === "number" && field.value !== ""
                  ? parseFloat(field.value)
                  : field.value
              }
              onChange={(e) => {
                const value =
                  type === "number"
                    ? e.target.value === ""
                      ? ""
                      : parseFloat(e.target.value)
                    : e.target.value;
                field.onChange(value);
              }}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default CustomInput;
