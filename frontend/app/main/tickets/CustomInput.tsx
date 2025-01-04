import { Control } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../../components/ui/form";
import { Input } from "../../../components/ui/input";
import { ticketSchema } from "@/lib/schemas";
import { z } from "zod";

type FieldName = keyof z.infer<typeof ticketSchema>;

type Props = {
  control: Control<z.infer<typeof ticketSchema>>;
  name: FieldName;
  label: string;
  placeholder: string;
  type?: string;
};

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
              onChange={(e) => field.onChange(e.target.value)}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default CustomInput;
