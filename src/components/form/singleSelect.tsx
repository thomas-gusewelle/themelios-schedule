import { Dispatch, Fragment, ReactNode, SetStateAction } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { MdOutlineKeyboardArrowDown } from "react-icons/md";

//this requies data to have an id and name property
export const SingleSelect: React.FC<{
  selected: any;
  setSelected: Dispatch<SetStateAction<any>>;
  list: any[];
}> = ({ selected, setSelected, list }) => {
  if (!list) return <div></div>;

  return (
    <div className=" block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
      <Listbox value={selected} onChange={(value) => setSelected(value)}>
        <div className="relative mt-1 ">
          <Listbox.Button className="relative h-full w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm">
            <div className="flex min-h-[1.5rem] flex-wrap">
              {selected.name || ""}
            </div>
            <div className="absolute right-1 top-1/2 -translate-y-1/2">
              <MdOutlineKeyboardArrowDown size={20} className="text-gray-500" />
            </div>
          </Listbox.Button>
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
              {list.map((item, index) => {
                if (item.show != false) {
                  return (
                    <Listbox.Option
                      key={index}
                      className={({ active }) =>
                        `relative cursor-default select-none py-2 pl-10 pr-4 ${active ? "bg-indigo-100" : "text-gray-900"
                        }`
                      }
                      value={item}
                    >
                      {({ selected }) => (
                        <>
                          <span
                            className={`block truncate ${selected
                                ? "font-medium text-indigo-700"
                                : "font-normal"
                              }`}
                          >
                            {item.name}
                          </span>
                        </>
                      )}
                    </Listbox.Option>
                  );
                }
              })}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
    </div>
  );
};

interface SingleSelectProps<ListItem> {
  selected: ListItem;
  setSelected: Dispatch<SetStateAction<ListItem>>;
  list: { item: ListItem; hide?: boolean }[];
  label: (item: ListItem) => any;
  showAdd?: boolean;
  showAddComponent?: ReactNode;
}

//this requies data to have an id and name property
// comma after generic is used ot tell TSX file that it is a type and not a componenet
export const NewSingleSelect = <List,>({
  selected,
  setSelected,
  list,
  label,
  showAdd = false,
  showAddComponent = <></>,
}: SingleSelectProps<List>) => {
  return (
    <div className=" block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
      <Listbox value={selected} onChange={(value) => setSelected(value)}>
        <div className="relative mt-1 ">
          <Listbox.Button className="relative h-full w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm">
            <div className="flex min-h-[1.5rem] flex-wrap">
              {label(selected)}
            </div>
            <div className="absolute right-1 top-1/2 -translate-y-1/2">
              <MdOutlineKeyboardArrowDown size={20} className="text-gray-500" />
            </div>
          </Listbox.Button>
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
              {list.map((item, index) => {
                if (item.hide != true) {
                  return (
                    <Listbox.Option
                      key={index}
                      className={({ active }) =>
                        `relative cursor-default select-none py-2 pl-4 pr-4 ${active ? "bg-indigo-100" : "text-gray-900"
                        }`
                      }
                      value={item.item}
                    >
                      {({ selected }) => (
                        <>
                          <span
                            className={`block truncate ${selected
                                ? "font-medium text-indigo-700"
                                : "font-normal"
                              }`}
                          >
                            {label(item.item)}
                          </span>
                        </>
                      )}
                    </Listbox.Option>
                  );
                }
              })}
              {showAddComponent}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
    </div>
  );
};

interface SingleSelectUncontrolledProps<ListItem> {
  defaultValue: ListItem;
  onChange?: (item: ListItem) => void;
  list: { item: ListItem; hide?: boolean }[];
  label: (item: ListItem) => ReactNode;
  showAdd?: boolean;
  showAddComponent?: ReactNode;
}

//this requies data to have an id and name property
// comma after generic is used ot tell TSX file that it is a type and not a componenet
export const UncontrolledSingleSelect = <List,>({
  defaultValue,
  onChange,
  list,
  label,
  showAdd = false,
  showAddComponent = <></>,
}: SingleSelectUncontrolledProps<List>) => {
  return (
    <div className=" block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
      <Listbox defaultValue={defaultValue} onChange={onChange}>
        <div className="relative mt-1 ">
          <Listbox.Button className="relative h-full w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm">
            {({ value }) => (
              <>
                <div className="flex min-h-[1.5rem] flex-wrap">
                  {label(value)}
                </div>
                <div className="absolute right-1 top-1/2 -translate-y-1/2">
                  <MdOutlineKeyboardArrowDown
                    size={20}
                    className="text-gray-500"
                  />
                </div>
              </>
            )}
          </Listbox.Button>
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
              {list.map((item, index) => {
                if (item.hide != true) {
                  return (
                    <Listbox.Option
                      key={index}
                      className={({ active }) =>
                        `relative cursor-default select-none py-2 pl-4 pr-4 ${active ? "bg-indigo-100" : "text-gray-900"
                        }`
                      }
                      value={item.item}
                    >
                      {({ selected }) => (
                        <>
                          <span
                            className={`block truncate ${selected
                                ? "font-medium text-indigo-700"
                                : "font-normal"
                              }`}
                          >
                            {label(item.item)}
                          </span>
                        </>
                      )}
                    </Listbox.Option>
                  );
                }
              })}
              {showAddComponent}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
    </div>
  );
};
