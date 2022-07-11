import { UserForm } from "../../components/form/userForm";
import SidebarLayout from "../../components/layout/sidebar";
import { useUser } from "@supabase/auth-helpers-react";
import { useRouter } from "next/router";
import { SectionHeading } from "../../components/headers/SectionHeading";
import { useForm } from "react-hook-form";
import { MultiSelect } from "../../components/form/multiSelect";
import { useEffect, useState } from "react";
import { trpc } from "../../utils/trpc";
import { Role } from "@prisma/client";
const AddUser = () => {
  const router = useRouter();
  const user = useUser();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const [roleList, setRoleList] = useState<any[]>([]);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const roles = trpc.useQuery(["role.getRoles"]);

  useEffect(() => {
    if (roles.status == "success") {
      setRoleList(roles.data as any);
    }
  }, [roles]);

  const submit = handleSubmit((data) => {
    console.log(data);
  });
  const [selected, setSelected] = useState([]);

  if (!user) {
    router.push("/signin");
    return <div></div>;
  }

  return (
    <SidebarLayout>
      <div className='mb-8'>
        <SectionHeading>Add User</SectionHeading>
      </div>
      <form onSubmit={submit} className='shadow'>
        <div className='grid grid-cols-6 gap-6 mb-6 px-6'>
          <div className='col-span-6 sm:col-span-3'>
            <label
              htmlFor='first-name'
              className='block text-sm font-medium text-gray-700'>
              First name
            </label>
            <input
              type='text'
              id='firstName'
              {...register("firstName", { required: true, minLength: 3 })}
              className='mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md'
            />
            {errors.firstName && (
              <span className='text-red-500'>First Name is Required</span>
            )}
          </div>

          <div className='col-span-6 sm:col-span-3'>
            <label
              htmlFor='last-name'
              className='block text-sm font-medium text-gray-700'>
              Last name
            </label>
            <input
              type='text'
              {...register("lastName", { required: true })}
              id='last-name'
              autoComplete='family-name'
              className='mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md'
            />
            {errors.lastName && (
              <span className='text-red-500'>Last Name is Required</span>
            )}
          </div>
          <div className='col-span-6 sm:col-span-4'>
            <label
              htmlFor='email-address'
              className='block text-sm font-medium text-gray-700'>
              Email address
            </label>
            <input
              type='text'
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value:
                    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
                  message: "Please enter a valid email",
                },
              })}
              id='email'
              autoComplete='email'
              className='mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md'
            />
            {errors.email && (
              <span className='text-red-500'>
                {errors.email.message as any}
              </span>
            )}
          </div>
          <div className='col-span-6 sm:col-span-3'>
            <label className='block text-sm font-medium text-gray-700'>
              Positions
            </label>
            <MultiSelect
              selected={selectedRoles}
              setSelected={setSelectedRoles}
              list={roleList}
              setList={setRoleList}></MultiSelect>
          </div>
        </div>
        <div className='px-4 py-3 bg-gray-50 text-right sm:px-6'>
          <button
            type='submit'
            className='inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'>
            Save
          </button>
        </div>
      </form>
      <div className='mt-10'>
        <UserForm></UserForm>
      </div>
    </SidebarLayout>
  );
};

export default AddUser;
