import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Control } from "react-hook-form";
import { z } from "zod";
import { packageSchema } from "@/lib/schemas";

interface Option {
  value: string;
  label: string;
}

type FormValues = z.infer<typeof packageSchema>;

interface CustomSelectProps {
  control: Control<FormValues>;
  name: keyof FormValues;
  label: string;
  placeholder?: string;
  required?: boolean;
  options: Option[];
}

export default function CustomSelect({
  control,
  name,
  label,
  placeholder,
  required,
  options,
}: CustomSelectProps) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </FormLabel>
          <Select 
            onValueChange={field.onChange} 
            defaultValue={field.value?.toString()}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
} 