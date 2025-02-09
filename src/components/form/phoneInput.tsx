import { useRef } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { formatPhoneNumber } from "../../utils/formatPhoneNumber";

export const PhoneInput = ({required = false}: {required?: boolean}) => {
  const phoneLength = useRef(0);
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext();
  return (
    <>
      <label htmlFor='phone-number' className='form-label'>
        Phone
      </label>

      <Controller
        name='phoneNumber'
        control={control}
        rules={{
          validate: {
            length: (value: string) => {
              if (value == "" && !required) return true;
              return value.replace(/-/g, "").trim().length == 10;
            },
          },
        }}
        defaultValue={""}
        render={({ field, fieldState }) => (
          <>
            <input
              type='tel'
              {...field}
              onChange={(e) => {
                const eLength = e.target.value.length;
                // checks if number is full length and prohibits extra input
                if (eLength == 13) return;
                // makes sure input is a number but allows for delation of first number
                if (
                  Number.isNaN(parseInt(e.target.value)) &&
                  e.target.value != ""
                )
                  return;

                //uses ref to track input length to determine if user is deleting or inputing new characters
                let add = true;
                if (eLength > phoneLength.current) {
                  add = true;
                  phoneLength.current = eLength;
                } else {
                  add = false;
                  phoneLength.current = eLength;
                }
                if (add) {
                  field.onChange(formatPhoneNumber(e.target.value));
                } else {
                  field.onChange(e.target.value);
                }
              }}
              id='phone'
              autoComplete='phone'
              className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
            />
            {fieldState.error && (
              <span className='text-red-500'>
                Please enter a valid phone number (###-###-####)
              </span>
            )}
          </>
        )}
      />
    </>
  );
};
