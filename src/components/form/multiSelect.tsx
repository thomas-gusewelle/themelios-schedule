import { Dispatch, FormEvent, Fragment, ReactNode, SetStateAction, useEffect, useState } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { MdOutlineKeyboardArrowDown } from "react-icons/md";
import { AiOutlineCloseCircle } from "react-icons/ai";

//this requies data to have an id and name property
export const MultiSelect: React.FC<{
  selected: any[];
  setSelected: Function;
  list: any[];
  setList: Function;
  disabled?: boolean;
}> = ({ selected, setSelected, list, setList, disabled = false }) => {
  const removeSelected = (item: any, e: FormEvent) => {
    e.stopPropagation();
    setSelected(selected.filter((e) => e.id != item.id));
    setList((arr: any) => [...arr, item]);
  };

  const addSelected = (items: any[]) => {
    if (!items) return;
    setList(list.filter((e) => !items.includes(e)));
    setSelected(items);
  };

  useEffect(() => {
    const filteredList = list.filter((e) =>
      selected.every((s) => s.id != e.id)
    );

    setList(filteredList);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!list) return <div></div>;

  return (
    <div className='mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'>
      <Listbox
        disabled={disabled}
        value={selected}
        onChange={(person) => addSelected(person)}
        multiple>
        <div className='relative mt-1 '>
          <Listbox.Button className='relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm'>
            <div className='flex min-h-[1rem] flex-wrap gap-2'>
              {selected.map((item) => (
                <div
                  className='flex items-center gap-2 rounded bg-indigo-100 py-1 px-2'
                  key={item.id}
                  onClick={(e) => {
                    if (disabled) return;
                    removeSelected(item, e);
                  }}>
                  {item.name}
                  {disabled == false && (
                    <AiOutlineCloseCircle
                      size={15}
                      className='cursor-pointer'
                    />
                  )}
                </div>
              ))}
            </div>
            <div className='absolute right-1 top-1/2 -translate-y-1/2'>
              <MdOutlineKeyboardArrowDown size={20} className='text-gray-500' />
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
                    `relative cursor-default select-none py-2 pl-10 pr-4 ${active ? "bg-indigo-100" : "text-gray-900"
                    }`
                  }
                  value={item}>
                  {({ selected }) => (
                    <>
                      <span
                        className={`block truncate ${selected
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


interface MultiSelectProps<ListItem extends { id: string }> {
  selected: ListItem[];
  setSelected: Dispatch<SetStateAction<ListItem[]>>;
  list: { item: ListItem; hide?: boolean }[];
  label: (item: ListItem) => any;
  showAdd?: boolean;
  showAddComponent?: ReactNode;
  disabled?: boolean
}

//this requies data to have an id and name property
// comma after generic is used ot tell TSX file that it is a type and not a componenet
export const NewMultiSelect = <List extends { id: string },>({
  selected,
  setSelected,
  list,
  label,
  showAdd = false,
  showAddComponent = <></>,
  disabled = false,
}: MultiSelectProps<List>) => {


  function removeSelected(item: List, e: FormEvent): void {
    e.stopPropagation();
    setSelected(selected.filter((e) => e.id != item.id));
    // setList((arr: any) => [...arr, item]);

  }
  return (
    <>
      {/*TODO: work out the generic version of multiselect for email schedule*/}
      <div className='mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'>
        <Listbox
          disabled={disabled}
          value={selected}
          onChange={(value) => { console.log("this is the value", value); setSelected(value) }}
          multiple>
          <div className='relative mt-1 '>
            <Listbox.Button className='relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm'>
              <div className='flex min-h-[1rem] flex-wrap gap-2'>
                {selected.map((item) => (
                  <div
                    className='flex items-center gap-2 rounded bg-indigo-100 py-1 px-2'
                    key={item.id}
                    onClick={(e) => {
                      if (disabled) return;
                      removeSelected(item, e);
                    }}>
                    {label(item)}
                    {disabled == false && (
                      <AiOutlineCloseCircle
                        size={15}
                        className='cursor-pointer'
                      />
                    )}
                  </div>
                ))}
              </div>
              <div className='absolute right-1 top-1/2 -translate-y-1/2'>
                <MdOutlineKeyboardArrowDown size={20} className='text-gray-500' />
              </div>
            </Listbox.Button>
            <Transition
              as={Fragment}
              leave='transition ease-in duration-100'
              leaveFrom='opacity-100'
              leaveTo='opacity-0'>
              <Listbox.Options className='absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm'>
                {list.map((item, i) => (
                  <Listbox.Option
                    key={i}
                    className={({ active }) =>
                      `relative cursor-default select-none py-2 pl-10 pr-4 ${active ? "bg-indigo-100" : "text-gray-900"
                      }`
                    }
                    value={item}>
                    {({ selected }) => (
                      <>
                        <span
                          className={`block truncate ${selected
                            ? "font-medium text-indigo-700"
                            : "font-normal"
                            }`}>
                          {label(item.item)}
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

    </>
  );
};
