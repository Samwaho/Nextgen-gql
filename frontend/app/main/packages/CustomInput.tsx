import { Control } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { packageSchema } from "@/lib/schemas";
import { z } from "zod";

type PackageFormValues = z.infer<typeof packageSchema>;

interface Props {
  control: Control<PackageFormValues>;
  name: keyof PackageFormValues;
  label: string;
  placeholder: string;
  type?: "text" | "number";
}

const CustomInput = ({
  control,
  name,
  label,
  placeholder,
  type = "text",
}: Props) => {
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
              value={field.value ?? ""}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default CustomInput;
