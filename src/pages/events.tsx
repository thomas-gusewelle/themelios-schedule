import { Event, EventPositions, Locations, Role, User } from "@prisma/client";
import { FormEvent, useEffect, useRef, useState } from "react";
import { PaginateData } from "../../types/paginate";
import { TableOptionsDropdown } from "../../types/tableMenuOptions";
import { BtnCancel } from "../components/btn/btnCancel";
import { BtnDelete } from "../components/btn/btnDelete";
import { CircularProgress } from "../components/circularProgress";
import { shortDate } from "../components/dateTime/dates";
import { shortTime } from "../components/dateTime/times";
import { SectionHeading } from "../components/headers/SectionHeading";
import { PaginationBar } from "../components/layout/pagination-bar";
import { sidebar } from "../components/layout/sidebar";
import { AddDropdownMenu } from "../components/menus/addDropdown";
import { TableDropdown } from "../components/menus/tableDropdown";
import { BottomButtons } from "../components/modal/bottomButtons";
import { Modal } from "../components/modal/modal";
import { ModalBody } from "../components/modal/modalBody";
import { ModalTitle } from "../components/modal/modalTitle";
import { PicNameRow, PicNameRowSmall } from "../components/profile/PicNameRow";
import { paginate } from "../utils/paginate";
import { trpc } from "../utils/trpc";

const filter = (e: string) => {};

const EventsPage = () => {
  const utils = trpc.useContext();
  const [error, setError] = useState({ state: false, message: "" });
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const eventId = useRef<{ id: string | null }>({ id: null });
  const [deleteAllRecurring, setDeleteAllRecuring] = useState<boolean>(false);

  const [pageNum, setPageNum] = useState(1);
  const [paginatedData, setpagiantedData] = useState<
    PaginateData<
      (Event & {
        Locations: Locations | null;
        positions: (EventPositions & {
          User: User[];
          Role: Role;
        })[];
      })[]
    >
  >();
  const [events, setEvents] = useState<
    (Event & {
      Locations: Locations | null;
      positions: (EventPositions & {
        User: User[];
        Role: Role;
      })[];
    })[]
  >([]);
  const [eventsPagianted, setEventsPaginated] = useState<
    (Event & {
      Locations: Locations | null;
      positions: (EventPositions & {
        User: User[];
        Role: Role;
      })[];
    })[]
  >([]);

  useEffect(() => {
    if (events != undefined) {
      const _paginated = paginate(events, pageNum, 15);
      setpagiantedData(_paginated);
      setEventsPaginated(_paginated.data);
    }
  }, [pageNum, events]);

  const eventsQuery = trpc.useQuery(
    ["events.getUpcomingEventsByOrganization"],
    {
      onSuccess(data) {
        if (data != undefined) {
          setEvents(data);
        }
      },
    }
  );

  const deleteEventMutation = trpc.useMutation("events.deleteEventById", {
    onMutate(data) {
      utils.queryClient.cancelQueries();

      if (deleteAllRecurring == false) {
        setEvents(events.filter((event) => event.id != data.id));
      }
      if (deleteAllRecurring == true) {
        let _event = events.filter((event) => event.id == data.id);
        setEvents(
          events.filter((event) => event.recurringId != _event[0]?.recurringId)
        );
      }
      setDeleteConfirm(false);
    },
    onError() {
      if (eventsQuery.data) {
        setEvents(eventsQuery.data);
      }
      eventsQuery.refetch();
    },
    onSuccess() {
      eventId.current.id = null;
      setDeleteAllRecuring(false);
      eventsQuery.refetch();
    },
  });

  const filter = (e: string) => {
    if (e.length > 0) {
      let key = e.toLowerCase();
      const filter = eventsQuery.data?.filter((event) => {
        console.log(
          "This is the date string: ",
          event.datetime.toLocaleString("default", { month: "long" })
        );
        return (
          event.name.toLowerCase().includes(key) ||
          event.Locations?.name.toLowerCase().includes(key) ||
          event.datetime.toLocaleDateString().toLowerCase().includes(key) ||
          event.datetime
            .toLocaleString("default", { month: "long" })
            .toLowerCase()
            .startsWith(key) ||
          event.positions.some((pos) =>
            pos.Role.name.toLowerCase().includes(key)
          ) ||
          event.positions.some((pos) =>
            pos.User.some(
              (user) =>
                user.firstName?.toLowerCase().includes(key) ||
                user.lastName?.toLowerCase().includes(key)
            )
          )
        );
      });
      console.log("This is the filter", filter);
      if (filter == undefined) return;
      setPageNum(1);
      setEvents(filter);
    } else {
      if (eventsQuery.data == undefined) return;
      setEvents(eventsQuery.data);
    }
  };

  const addOptions: TableOptionsDropdown = [
    { name: "New Event", href: "/events/addevent" },
    { name: "From Template", href: "#" },
  ];

  if (paginatedData == undefined) {
    return null;
  }

  if (eventsQuery.isLoading) {
    return (
      <div className='flex justify-center'>
        <CircularProgress />
      </div>
    );
  }

  return (
    <>
      <Modal open={deleteConfirm} setOpen={setDeleteConfirm}>
        <div className='flex justify-center'>
          <ModalBody>
            <ModalTitle
              text={
                deleteAllRecurring
                  ? "Are you sure you want to delete all events in this reccurance?"
                  : "Are you sure you want to delete this event?"
              }
            />
            <BottomButtons>
              <BtnDelete
                onClick={() => {
                  if (eventId.current.id != null)
                    deleteEventMutation.mutate({
                      id: eventId.current.id,
                      deleteRecurring: deleteAllRecurring,
                    });
                }}
              />
              <BtnCancel onClick={() => setDeleteConfirm(false)} />
            </BottomButtons>
          </ModalBody>
        </div>
      </Modal>
      {/* MD Top Bar */}
      <div className='mb-8 grid grid-cols-2 gap-4 md:hidden'>
        <SectionHeading>Events</SectionHeading>
        <div className='flex justify-end'>
          <AddDropdownMenu options={addOptions} />
        </div>
        <div className='col-span-2'>
          <input
            onChange={(e) => filter(e.target.value)}
            className='w-full rounded-xl border border-gray-100 bg-gray-100 py-2 pl-4 text-sm text-gray-500 focus:border-indigo-700 focus:outline-none'
            type='text'
            placeholder='Search'
          />
        </div>
      </div>

      {/* Desktop Top Bar */}
      <div className='mb-8 hidden justify-between md:flex'>
        <SectionHeading>Events</SectionHeading>
        <div className='flex gap-4'>
          <input
            onChange={(e) => filter(e.target.value)}
            className='w-full rounded-xl border border-gray-100 bg-gray-100 py-2 pl-4 text-sm text-gray-500 focus:border-indigo-700 focus:outline-none'
            type='text'
            placeholder='Search'
          />
          {/* <SearchBar /> */}
          <AddDropdownMenu options={addOptions} />
        </div>
      </div>

      <div className='mb-6 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4'>
        {eventsPagianted.map((event) => (
          <div
            key={event.id}
            className='flex flex-col rounded-lg border border-gray-300 pt-4 shadow'>
            <div className='mb-4 flex flex-col px-3'>
              <div className='flex justify-between'>
                <h3 className='text-xl font-bold'>{event.name}</h3>
                <TableDropdown
                  options={[
                    { name: "Schedule", href: `/schedule?cursor=${event.id}` },
                    {
                      name: "Edit",
                      href: `/events/edit/${event.id}?rec=false`,
                    },
                    {
                      name: "Edit Recurring",
                      href: `/events/edit/${event.id}?rec=true`,
                      show: event.recurringId ? true : false,
                    },
                    {
                      name: "Delete",
                      function: () => {
                        eventId.current.id = event.id;
                        setDeleteAllRecuring(false);
                        setDeleteConfirm(true);
                      },
                    },
                    {
                      name: "Delete Recurring",
                      function: () => {
                        setDeleteAllRecuring(true);
                        eventId.current.id = event.id;
                        setDeleteConfirm(true);
                      },
                      show: event.recurringId ? true : false,
                    },
                  ]}
                />
              </div>
              <span className='text-lg font-medium'>
                {event.Locations?.name}
              </span>
              <span>{shortDate(event.datetime)}</span>
              <span>{shortTime(event.datetime)}</span>
            </div>
            <div className=''>
              {event.positions.map((position) => {
                let positionNum = [];
                for (let i = 1; i <= position.numberNeeded; i++) {
                  positionNum.push(i);
                }
                return positionNum.map((num, index) => (
                  <div
                    className='grid grid-cols-[1fr_1.5fr] items-center border-t last:rounded-b-lg last:border-b last:pb-0'
                    key={position.id + index}>
                    <span className='py-3 px-3 font-medium'>
                      {position.Role.name}
                    </span>
                    {position.User[index] ? (
                      <div
                        className={`flex h-full py-1 px-3 text-center ${
                          position.userResponse == null && "bg-gray-100"
                        }
                    ${position.userResponse == true && "bg-green-200"}
                    ${position.userResponse == false && "bg-red-200"}
                    `}>
                        <PicNameRowSmall user={position?.User[index]} />
                      </div>
                    ) : (
                      <div className='flex h-full items-center justify-center bg-gray-100 py-3 px-6 text-center leading-4'>
                        Not Scheduled
                      </div>
                    )}
                  </div>
                ));
              })}
            </div>
          </div>
        ))}
      </div>
      <PaginationBar
        setPageNum={setPageNum}
        pageNum={pageNum}
        paginateData={paginatedData}
      />
    </>
  );
};

EventsPage.getLayout = sidebar;

export default EventsPage;
