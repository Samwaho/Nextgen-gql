import { Control } from "react-hook-form";
import { agencySchema } from "@/lib/schemas";
import { z } from "zod";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

// Define a union type for the name prop based on agencySchema
type FieldName = keyof z.infer<typeof agencySchema>;

type Props = {
  control: Control<z.infer<typeof agencySchema>>;
  name: FieldName;
  label: string;
  placeholder: string;
};

const CustomInput = ({ control, name, label, placeholder }: Props) => {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="dark:text-white">{label}</FormLabel>
          <FormControl>
            <Input placeholder={placeholder} {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default CustomInput;
