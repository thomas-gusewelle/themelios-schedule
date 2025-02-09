import { useRouter } from "next/router";
import { useContext, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { BtnPurple } from "../../components/btn/btnPurple";
import { BtnRed } from "../../components/btn/btnRed";
import { SliderBtn } from "../../components/btn/SliderBtn";
import { Divider } from "../../components/divider";
import { SectionHeading } from "../../components/headers/SectionHeading";
import { sidebar } from "../../components/layout/sidebar";
import { DeleteAccountConfirm } from "../../components/modal/userSettings/deleteAccountConfirm";
import { EmailChange } from "../../components/modal/userSettings/emailChange";
import { PasswordChange } from "../../components/modal/userSettings/passwordChange";
import { AlertContext } from "../../providers/alertProvider";
import { UserContext } from "../../providers/userProvider";
import { api } from "../../server/utils/api";
import { createClient } from "../../utils/supabase/client";

const UserSettingsPage = () => {
  const user = useContext(UserContext);
  const utils = api.useUtils();
  const router = useRouter();
  const supabase = createClient();
  const { setError, setSuccess } = useContext(AlertContext);
  const [openEditEmail, setOpenEditEmail] = useState(false);
  const [openEditPassword, setOpenEditPassword] = useState(false);
  const hidePhoneNum = useRef(user?.UserSettings?.hidePhoneNum ?? false);
  const reminderEmails = useRef(user?.UserSettings?.sendReminderEmail ?? true);
  const changePhoneNumMutation =
    api.userSettings.changeHidePhoneNum.useMutation({
      onError(err) {
        hidePhoneNum.current = user?.UserSettings?.hidePhoneNum ?? false;
        reminderEmails.current = user?.UserSettings?.sendReminderEmail ?? true;
        setError({ state: true, message: err.message });
      },
      onSuccess() {
        utils.user.getUser.invalidate();
        setSuccess({ state: true, message: "Setting successfully saved" });
      },
    });
  const [deleteAccountConfirm, setDeleteAccountConfirm] = useState(false);
  const deleteAccount = api.userSettings.deleteAccount.useMutation({
    onSuccess: async () => {
      await supabase.auth.signOut();
      router.push("/");
    },
    onError(err) {
      setError({ state: true, message: err.message });
    },
  });

  return (
    <div className="mx-auto max-w-[960px]">
      <section>
        <SectionHeading>Account</SectionHeading>
        <div className="mt-3 flex items-center justify-between">
          <h3 className="text-xl font-bold">Email</h3>
          <p>{user?.email}</p>
          <div className="w-min">
            <BtnPurple
              onClick={() => {
                setOpenEditEmail(true);
              }}
            >
              Edit
            </BtnPurple>
          </div>
        </div>
        {openEditEmail &&
          createPortal(
            <EmailChange open={openEditEmail} setOpen={setOpenEditEmail} />,
            document.body
          )}
        <div className="mt-3 flex items-center justify-between">
          <h3 className="text-xl font-bold">Password</h3>
          <p>*********</p>
          <div className="w-min">
            <BtnPurple onClick={() => setOpenEditPassword(true)}>
              Edit
            </BtnPurple>
          </div>
        </div>
        {openEditPassword &&
          createPortal(
            <PasswordChange
              open={openEditPassword}
              setOpen={setOpenEditPassword}
            />,
            document.body
          )}

        <Divider />
      </section>
      <section>
        <SectionHeading>Privacy</SectionHeading>
        <div className="mt-3 flex items-center justify-between">
          <h3 className="text-xl font-bold">Hide Phone Number</h3>
          <SliderBtn
            mutation={() =>
              changePhoneNumMutation.mutate({
                sendReminderEmail: reminderEmails.current,
                hidePhoneNum: hidePhoneNum.current,
              })
            }
            isChecked={hidePhoneNum}
          />
        </div>
        <Divider />
      </section>
      <section>
        <SectionHeading>Notifications</SectionHeading>
        <div className="mt-3 flex items-center justify-between">
          <h3 className="text-xl font-bold">Reminder Emails</h3>
          <SliderBtn
            mutation={() =>
              changePhoneNumMutation.mutate({
                sendReminderEmail: reminderEmails.current,
                hidePhoneNum: hidePhoneNum.current,
              })
            }
            isChecked={reminderEmails}
          />
        </div>
        <Divider />
      </section>
      <section>
        <BtnRed onClick={() => setDeleteAccountConfirm(true)}>
          Delete Account
        </BtnRed>
        {deleteAccountConfirm &&
          createPortal(
            <DeleteAccountConfirm
              open={deleteAccountConfirm}
              setOpen={setDeleteAccountConfirm}
              submit={() => deleteAccount.mutate()}
              isLoading={deleteAccount.isPending}
            />,
            document.body
          )}
      </section>
    </div>
  );
};
UserSettingsPage.getLayout = sidebar;
export default UserSettingsPage;
