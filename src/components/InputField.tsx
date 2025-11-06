import * as React from "react";

type InputFieldProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
};

export const InputField = React.forwardRef<HTMLInputElement, InputFieldProps>(
  ({ id, name, label, ...props }, ref) => {
    return (
      <>
        <label htmlFor={id} className="block font-normal mb-2">
          {label}
        </label>

        <input
          id={id}
          name={name}
          ref={ref}
          className="w-full rounded-[20px] border-[2px] bg-[#F5F5F5] border-[#595B72] mt-4
                     px-3 py-4 outline-none font-normal transition
                     focus:border-[#6B6E8D] focus:shadow-[0_0_8px_rgba(107,110,141,0.5)]"
          {...props}
        />
      </>
    );
  }
);

InputField.displayName = "InputField";
