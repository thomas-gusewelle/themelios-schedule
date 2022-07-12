import { Menu, Transition } from "@headlessui/react";
import { Fragment } from "react";
import SidebarLayout from "../components/layout/sidebar";
import { PicNameRow } from "../components/profile/PicNameRow";
import { trpc } from "../utils/trpc";
import { BiChevronDown } from "react-icons/bi";
import { AddUserMenu } from "../components/menus/addUser";
import { SectionHeading } from "../components/headers/SectionHeading";
import { SearchBar } from "../components/form/SearchBar";
import Link from "next/link";
import { CircularProgress } from "../components/circularProgress";
import { User } from "@prisma/client";

const PeoplePage = () => {
  const people = trpc.useQuery(["user.getUsersByOrganization"]);
  const adminCount = trpc.useQuery(["user.getAmdminCount"]);
  const deleteUser = trpc.useMutation("user.deleteUserByID", {
    onError: (error) => {
      console.log(error);
    },
    onSuccess: () => {
      people.refetch();
    },
  });

  const onDelete = (person: User) => {
    if (adminCount.isLoading) return;
    if (adminCount.error) return;
    if (adminCount.data == undefined) return;
    console.log("number of admins", adminCount.data);
    if (adminCount.data <= 1 && person.status == "ADMIN") {
      alert("You must have at least one admin user");
      return;
    }

    deleteUser.mutate(person.id);
  };

  function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(" ");
  }

  if (people.error) {
    return (
      <SidebarLayout>
        <div>{people.error.message}</div>;
      </SidebarLayout>
    );
  }

  if (people.isLoading) {
    return (
      <SidebarLayout>
        <div className='flex justify-center'>
          <CircularProgress />
        </div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout>
      {/* MD Top Bar */}
      <div className='md:hidden grid grid-cols-2 mb-8 gap-4'>
        <SectionHeading>Users</SectionHeading>
        <div className='flex justify-end'>
          <AddUserMenu />
        </div>
        <div className='col-span-2'>
          <SearchBar />
        </div>
      </div>

      {/* Desktop Top Bar */}
      <div className='hidden md:flex justify-between mb-8'>
        <SectionHeading>Users</SectionHeading>
        <div className='flex gap-4'>
          <SearchBar />
          <AddUserMenu />
        </div>
      </div>

      <div className='w-full bg-white'>
        <table className='w-full table-auto text-left'>
          <thead>
            <tr>
              <th>Name</th>
              <th className='hidden md:table-cell'>Email</th>
              <th>Role</th>
              <th className='hidden md:table-cell'>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {people.data?.map((person, index) => (
              <tr key={index} className='border-t last:border-b'>
                <td className='py-4'>
                  <PicNameRow user={person} />
                </td>
                <td className='hidden md:table-cell'>{person.email}</td>
                <td className='flex flex-wrap gap-1 items-center justify-start my-1'>
                  {person.roles.map((role, index) => (
                    <div
                      key={index}
                      className='px-2 bg-indigo-200 rounded-xl text-center'>
                      {role.name}
                    </div>
                  ))}
                </td>
                <td className='hidden md:table-cell'>{person.status}</td>

                <td>
                  <Menu as='div' className='relative inline-block text-left'>
                    <div>
                      <Menu.Button className='inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-indigo-500'>
                        <BiChevronDown aria-hidden='true' />
                      </Menu.Button>
                    </div>

                    <Transition
                      as={Fragment}
                      enter='transition ease-out duration-100'
                      enterFrom='transform opacity-0 scale-95'
                      enterTo='transform opacity-100 scale-100'
                      leave='transition ease-in duration-75'
                      leaveFrom='transform opacity-100 scale-100'
                      leaveTo='transform opacity-0 scale-95'>
                      <Menu.Items className='origin-top-right z-50 absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none'>
                        <div className='py-1'>
                          <Menu.Item>
                            {({ active }) => (
                              <Link href={"#"}>
                                <a
                                  className={classNames(
                                    active
                                      ? "bg-gray-100 text-gray-900"
                                      : "text-gray-700",
                                    "block px-4 py-2 text-sm"
                                  )}>
                                  View Profile
                                </a>
                              </Link>
                            )}
                          </Menu.Item>
                          <Menu.Item>
                            {({ active }) => (
                              <Link href={`/people/edit/${person.id}`}>
                                <a
                                  className={classNames(
                                    active
                                      ? "bg-gray-100 text-gray-900"
                                      : "text-gray-700",
                                    "block px-4 py-2 text-sm"
                                  )}>
                                  Edit
                                </a>
                              </Link>
                            )}
                          </Menu.Item>

                          <Menu.Item>
                            {({ active }) => (
                              <button
                                onClick={() => onDelete(person)}
                                className={classNames(
                                  active
                                    ? "bg-gray-100 text-gray-900"
                                    : "text-gray-700",
                                  "block w-full text-left px-4 py-2 text-sm"
                                )}>
                                Delete
                              </button>
                            )}
                          </Menu.Item>
                        </div>
                      </Menu.Items>
                    </Transition>
                  </Menu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SidebarLayout>
  );
};

export default PeoplePage;
