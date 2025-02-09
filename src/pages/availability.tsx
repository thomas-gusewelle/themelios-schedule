import { Availability, User } from "@prisma/client";
import { Suspense, useContext, useEffect, useState } from "react";
import { PaginateData } from "../../types/paginate";
import { TableOptionsDropdown } from "../../types/tableMenuOptions";
import { BtnAdd } from "../components/btn/btnAdd";
import { BtnPurple } from "../components/btn/btnPurple";
import { CircularProgress } from "../components/circularProgress";
import { longDate } from "../components/dateTime/dates";
import {
  NewSingleSelect,
  UncontrolledSingleSelect,
} from "../components/form/singleSelect";
import { SectionHeading } from "../components/headers/SectionHeading";
import { NoDataLayout } from "../components/layout/no-data-layout";
import { PaginationBar } from "../components/layout/pagination-bar";
import { sidebar } from "../components/layout/sidebar";
import { TableDropdown } from "../components/menus/tableDropdown";
import { AvaililityModal } from "../components/modal/availibilityModal";
import { AlertContext } from "../providers/alertProvider";
import { UserContext } from "../providers/userProvider";
import { fullName } from "../utils/fullName";
import { paginate } from "../utils/paginate";
import { api } from "../server/utils/api";
import { useRouter } from "next/router";

const AvailabilityPage = ({ userId }: { userId: string }) => {
  const router = useRouter();
  const { setError, setSuccess } = useContext(AlertContext);
  const [limit, setLimit] = useState(4);
  const [modalOpen, setModalOpen] = useState(false);
  const [dates, setDates] = useState<Availability[]>([]);
  const [pagiantedData, setpagiantedData] =
    useState<PaginateData<Availability[]>>();
  const [pageNum, setPageNum] = useState(1);
  const user = useContext(UserContext);
  const [peopleList, setPeopleList] = useState<{ item: User; label: string }[]>(
    []
  );

  useEffect(() => {
    if (dates != undefined) {
      const _paginated = paginate(dates, pageNum);
      setpagiantedData(_paginated);
      // setlocationPaginated(_paginated.data);
    }
  }, [dates, pageNum]);

  const deleteDateMutation = api.avalibility.deleteDate.useMutation({
    onSuccess(data) {
      setDates(dates.filter((item) => item.id != data?.id));
      getUserAvailibilityQuery.refetch();
      setSuccess({ state: true, message: "Date deleted successfully" });
    },
    onError(err) {
      setError({
        state: true,
        message: `There was an error deleting this date. Message: ${err.message}`,
      });
    },
  });

  const getUserAvailibilityQuery =
    api.avalibility.getUserAvalibilityByID.useQuery(userId);
  useEffect(() => {
    if (getUserAvailibilityQuery.isSuccess) {
      setDates(
        getUserAvailibilityQuery.data?.sort(
          (a, b) => a.date.getTime() - b.date.getTime()
        ) ?? []
      );
    } else if (getUserAvailibilityQuery.isError) {
      setError({
        state: true,
        message: `There was an error fetching the user availibility. Message: ${getUserAvailibilityQuery.error.message}`,
      });
      getUserAvailibilityQuery.refetch();
    }
  }, [getUserAvailibilityQuery]);

  if (pagiantedData == undefined || getUserAvailibilityQuery.isLoading) {
    return (
      <div className="flex justify-center">
        <CircularProgress />
      </div>
    );
  }

  // if (userSelected === null) {
  //   return <div>Error</div>
  // }

  if (pagiantedData.data.length <= 0 && user?.status != "ADMIN") {
    return (
      <>
        <AvaililityModal
          userId={userId}
          open={modalOpen}
          setOpen={setModalOpen}
          exisitingDates={dates}
          setExisitingDates={setDates}
        />

        <NoDataLayout
          heading={"Unavailable Dates"}
          func={() => setModalOpen(true)}
          btnText={"Add Unavailable Dates"}
        />
      </>
    );
  }

  if (pagiantedData.data.length <= 0 && user?.status == "ADMIN") {
    return (
      <>
        <AvaililityModal
          userId={userId}
          open={modalOpen}
          setOpen={setModalOpen}
          exisitingDates={dates}
          setExisitingDates={setDates}
        />
        <div className="mb-8 grid grid-cols-2 gap-4 md:hidden">
          <SectionHeading>Unavailable Dates</SectionHeading>
          <div className="flex justify-end">
            <BtnAdd onClick={() => setModalOpen(true)} />
            {/* <LimitSelect selected={limit} setSelected={setLimit} /> */}
          </div>
          {user?.status == "ADMIN" && (
            <Suspense fallback={<></>}>
              <AdminUserSelector selectedUser={userId} />
            </Suspense>
          )}
        </div>
        <div className="mb-8 hidden justify-between md:flex">
          <SectionHeading>Unavailable Dates</SectionHeading>
          <div className="flex gap-4">
            {user?.status == "ADMIN" && (
              <Suspense fallback={<></>}>
                <AdminUserSelector selectedUser={userId} />
              </Suspense>
            )}
            <BtnAdd onClick={() => setModalOpen(true)} />
            {/* <LimitSelect selected={limit} setSelected={setLimit} /> */}
          </div>
        </div>
        <div className="flex justify-center">
          <BtnPurple onClick={() => setModalOpen(true)}>
            Add Unavailable Dates
          </BtnPurple>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="mb-8 grid grid-cols-2 gap-4 md:hidden">
        <SectionHeading>Unavaliable Dates</SectionHeading>
        <div className="flex justify-end">
          <BtnAdd onClick={() => setModalOpen(true)} />
          {/* <LimitSelect selected={limit} setSelected={setLimit} /> */}
        </div>
        {user?.status == "ADMIN" && (
          <Suspense fallback={<></>}>
            <AdminUserSelector selectedUser={userId} />
          </Suspense>
        )}
      </div>
      <div className="mb-8 hidden justify-between md:flex">
        <SectionHeading>Unavailable Dates</SectionHeading>
        <div className="flex gap-4">
          {user?.status == "ADMIN" && (
          <Suspense fallback={<></>}>
            <AdminUserSelector selectedUser={userId} />
          </Suspense>
          )}
          <BtnAdd onClick={() => setModalOpen(true)} />
          {/* <LimitSelect selected={limit} setSelected={setLimit} /> */}
        </div>
      </div>

      <AvaililityModal
        userId={userId}
        open={modalOpen}
        setOpen={setModalOpen}
        exisitingDates={dates}
        setExisitingDates={setDates}
      />
      <>
        {getUserAvailibilityQuery.isLoading ? (
          <div className="flex justify-center">
            <CircularProgress />
          </div>
        ) : (
          <>
            <div className="w-full">
              <table className="w-full table-auto text-left">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pagiantedData.data.map((date, index) => {
                    const options: TableOptionsDropdown = [
                      {
                        name: "Delete",
                        function: () => {
                          deleteDateMutation.mutate(date.id);
                        },
                      },
                    ];

                    return (
                      <tr key={index} className="border-t last:border-b">
                        <td className="py-4 text-base leading-4 text-gray-800 md:text-xl">
                          {longDate(date.date)}
                        </td>
                        <td className="">
                          <TableDropdown options={options} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <PaginationBar
              setPageNum={setPageNum}
              pageNum={pageNum}
              paginateData={pagiantedData}
            />
          </>
        )}
      </>
    </>
  );
};

const AvalibiltyWrapper = () => {
  const router = useRouter();
  const { userId } = router.query;

  if (!userId || typeof userId != "string") {
    return <div>Error</div>;
  }

  return <AvailabilityPage userId={decodeURIComponent(userId)} />;
};

AvalibiltyWrapper.getLayout = sidebar;

export default AvalibiltyWrapper;

const AdminUserSelector = ({ selectedUser }: { selectedUser: string }) => {
  const router = useRouter();
  const user = useContext(UserContext);
  if (user?.status != "ADMIN") {
    return null;
  }

  const [users, getUsersQuery] =
    api.user.getUsersByOrganization.useSuspenseQuery(undefined);

  // const currentUserIndex = users.findIndex((user) => user.id === selectedUser);

  return (
    <div className="col-span-2">
        <UncontrolledSingleSelect
          defaultValue={
            users[users.findIndex((user) => user.id === selectedUser)]
          }
          onChange={(item) => {
            console.log("here");
            router.push(`/availability?userId=${encodeURIComponent(item!.id)}`);
          }}
          list={users.map((user) => ({ item: user, show: true }))}
          label={(item) => item?.firstName + " " + item?.lastName}
        />
    </div>
  );
};
