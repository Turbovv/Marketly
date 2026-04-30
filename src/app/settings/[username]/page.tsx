import UserSettings from "~/components/Settings/settings";

export default function UserSettingsPage(props: {
  params: { username: string };
}) {
  return (
    <div>
      <UserSettings username={props.params.username} />
    </div>
  )
}
