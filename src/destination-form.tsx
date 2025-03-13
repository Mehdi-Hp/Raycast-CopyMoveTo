import { Action, ActionPanel, Form, LocalStorage, Toast, popToRoot, showToast } from "@raycast/api";

import { FormValidation, useForm } from "@raycast/utils";
import { type Destination, destinationRepo } from "./repo/destination";
import { checkDirExists } from "./utils/filesystem";

interface EditDestinationProps {
  destination?: Destination;
}

export type DestinationForm = Omit<Destination, "directory"> & {
  directory: string[];
};
export default function DestinationForm(props: EditDestinationProps) {
  const { handleSubmit, itemProps } = useForm<DestinationForm>({
    async onSubmit(values) {
      const allDestinations = await destinationRepo.getAll();
      const newDestination = {
        name: values.name,
        directory: values.directory[0],
        enableCopy: values.enableCopy,
        enableMove: values.enableMove,
        pinned: false,
      };

      const pathExists = await checkDirExists(newDestination.directory);
      if (!pathExists) {
        showToast({
          style: Toast.Style.Failure,
          title: "Directory does not exist",
        });
        return;
      }

      if (props.destination) {
        // ? Name(key) is getting updated
        if (!allDestinations[newDestination.name]) {
          await LocalStorage.removeItem(props.destination.name);
        }
      }
      await destinationRepo.saveOne(newDestination);

      showToast({
        style: Toast.Style.Success,
        title: props.destination ? "Destination updated" : "Destination added",
      });

      popToRoot();
    },
    initialValues: {
      name: props.destination?.name,
      directory: props.destination?.directory ? [props.destination.directory] : [],
      enableCopy: props.destination?.enableCopy ?? true,
      enableMove: props.destination?.enableMove ?? true,
    },
    validation: {
      name: FormValidation.Required,
      directory: FormValidation.Required,
    },
  });

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Save Destination" onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.TextField title="Name" placeholder="Enter destination name" {...itemProps.name} />
      <Form.FilePicker
        title="Destination Directory"
        allowMultipleSelection={false}
        canChooseDirectories={true}
        canChooseFiles={false}
        storeValue={true}
        {...itemProps.directory}
      />

      <Form.Checkbox label="Enable Copy" {...itemProps.enableCopy} />
      <Form.Checkbox label="Enable Move" {...itemProps.enableMove} />
    </Form>
  );
}
