import { FormEvent, Fragment, useEffect, useState } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { MdOutlineArrowDropDownCircle } from "react-icons/md";
import { AiOutlineCloseCircle } from "react-icons/ai";
// import { CheckIcon, SelectorIcon } from "@heroicons/react/solid";
export const MultiSelect: React.FC<{
  selected: any[];
  setSelected: Function;
  list: any[];
  setList: Function;
}> = ({ selected, setSelected, list, setList }) => {
  const removeSelected = (item: any, e: FormEvent) => {
    e.stopPropagation();
    setSelected(selected.filter((e) => e.id != item.id));
    // setList((arr: any) => [...arr, item]);
  };

  const addSelected = (items: any[]) => {
    if (!items) return;
    console.log(items);

    // setList(list.filter((e) => !items.includes(e)));
    setSelected(items);
  };

  useEffect(() => {
    console.log("This is the list", list);
  }, [list]);

  if (!list) return <div></div>;

  return (
    <div className=' focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md'>
      <Listbox
        value={selected}
        onChange={(person) => addSelected(person)}
        multiple>
        <div className='relative mt-1 '>
          <Listbox.Button className='relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left shadow-md focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm'>
            <div className='flex flex-wrap gap-2'>
              {selected.map((item) => (
                <div
                  className='flex gap-2 items-center z-50 py-1 px-2 rounded bg-indigo-100'
                  key={item.id}
                  onClick={(e) => removeSelected(item, e)}>
                  {item.name}
                  <AiOutlineCloseCircle size={15} className='cursor-pointer' />
                </div>
              ))}
            </div>
            <div className='flex justify-end items-center'>
              <MdOutlineArrowDropDownCircle
                size={30}
                className='text-indigo-700'
              />
            </div>
          </Listbox.Button>
          <Transition
            as={Fragment}
            leave='transition ease-in duration-100'
            leaveFrom='opacity-100'
            leaveTo='opacity-0'>
            <Listbox.Options className='absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm'>
              {list.map((item) => (
                <Listbox.Option
                  key={item.id}
                  className={({ active }) =>
                    `relative cursor-default select-none py-2 pl-10 pr-4 ${
                      active ? "bg-indigo-100" : "text-gray-900"
                    }`
                  }
                  value={item}>
                  {({ selected }) => (
                    <>
                      <span
                        className={`block truncate ${
                          selected
                            ? "font-medium text-indigo-700"
                            : "font-normal"
                        }`}>
                        {item.name}
                      </span>
                    </>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
    </div>
  );
};
