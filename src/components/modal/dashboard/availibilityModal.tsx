import {
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from "react";
import { Controller, useForm } from "react-hook-form";
import { Modal } from "../modal";
import { ModalBody } from "../modalBody";
import { ModalTitle } from "../modalTitle";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { BottomButtons } from "../bottomButtons";
import { BtnSave } from "../../btn/btnSave";
import { BtnCancel } from "../../btn/btnCancel";
import { MdDelete } from "react-icons/md";
import { trpc } from "../../../utils/trpc";
import { Availability } from "@prisma/client";
import { UserContext } from "../../../providers/userProvider";
import { CircularProgress } from "../../circularProgress";
import { AlertContext } from "../../../providers/alertProvider";

export const DashboardAvaililityModal: React.FC<{
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}> = ({ open, setOpen }) => {
  const methods = useForm();
  const user = useContext(UserContext);
  const alertContext = useContext(AlertContext);
  const [dates, setDates] = useState<Date[]>([]);
  const opts = trpc.useContext();

  const existingDates = trpc.useQuery(["avalibility.getUserAvalibility"], {
    enabled: !!open,
    onError(err) {
      alertContext.setError({
        state: true,
        message: `Error getting user availability. ${err.message}`,
      });
    },
    onSuccess(data) {
      if (!data) return;
      console.log(data);

      setDates(data.map((item) => item.date));
    },
  });

  const updateAvailibility = trpc.useMutation(
    "avalibility.updateUserAvalibility",
    {
      onSuccess() {
        setOpen(false);
        opts.refetchQueries(["avalibility.getUserAvalibilityByID"]);
      },
    }
  );

  const submit = () => {
    if (user?.id == undefined) return;

    const newDates = dates.filter(
      (date) =>
        !existingDates.data
          ?.map((item) => item.date.getTime())
          .includes(date.getTime())
    );

    const deleteDates = existingDates.data?.filter(
      (date) =>
        !dates.map((item) => item.getTime()).includes(date.date.getTime())
    );

    updateAvailibility.mutate({
      userId: user?.id,
      newDates: newDates,
      deleteDates: deleteDates?.map((item) => item.date) ?? [],
    });
  };

  useEffect(() => {
    console.log(dates);
  }, [dates]);

  if (existingDates.isLoading) {
    return (
      <Modal open={open} setOpen={setOpen}>
        <div className='flex min-h-[200px] min-w-[200px] items-center justify-center'>
          <CircularProgress />
        </div>
      </Modal>
    );
  }

  return (
    <Modal open={open} setOpen={setOpen}>
      <form onSubmit={submit} className=' '>
        <ModalBody>
          <ModalTitle text={"Add Unavailable Dates"} />

          <div className='w-full'>
            {/* <label className="text-gray-700">End Date</label> */}
            <div className='mt-6 flex flex-col gap-3'>
              <Controller
                name='Date'
                control={methods.control}
                rules={{ required: true }}
                // defaultValue={{ start: new Date(), end: null }}
                defaultValue={null}
                render={({ field: { value, onChange } }) => (
                  <div className='customDate'>
                    <DatePicker
                      id='aDate'
                      autoComplete='off'
                      selected={null}
                      minDate={new Date()}
                      onChange={(date) => {
                        // onChange(date);
                        if (date) {
                          //checks if the date is included in the new dates list already and removes it. Triggered when a user clicks on a date already highlighted
                          console.log(date);
                          console.log(
                            dates
                              .map((item) => item.getTime())
                              .includes(date.getTime())
                          );
                          if (
                            dates
                              .map((item) => item.getTime())
                              .includes(date.getTime())
                          ) {
                            setDates(
                              dates.filter(
                                (item) => item.getTime() != date.getTime()
                              )
                            );
                          } else {
                            setDates([...dates, date]);
                          }
                        }
                      }}
                      highlightDates={dates}
                      inline
                      className='customDate m-0 block w-full rounded-l border border-solid border-gray-300 bg-white bg-clip-padding px-3 py-1.5 text-base font-normal text-gray-700 transition ease-in-out focus:border-blue-600 focus:bg-white focus:text-gray-700 focus:outline-none'
                    />
                  </div>
                )}
              />

              <div className='flex flex-col justify-center gap-3'>
                {dates.map((date, index) => (
                  <div key={index} className='grid grid-cols-[2fr_.5fr] gap-3'>
                    <span>{date.toDateString()}</span>
                    <button
                      className='text-red-600'
                      onClick={(e) => {
                        e.preventDefault();
                        setDates(
                          dates.filter(
                            (item) => item.getTime() != date.getTime()
                          )
                        );
                      }}>
                      <MdDelete size={25} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            {/* {methods.formState.errors.DDate && (
                            <span className="text-red-500">End Date Required</span>
                        )} */}
          </div>
        </ModalBody>
        <BottomButtons>
          <BtnSave
            type={"button"}
            onClick={() => {
              submit();
            }}
          />
          <BtnCancel
            onClick={() => {
              setOpen(false);
            }}
          />
        </BottomButtons>
      </form>
    </Modal>
  );
};
