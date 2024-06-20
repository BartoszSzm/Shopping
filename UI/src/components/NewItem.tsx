import {
  Button,
  Flex,
  FormControl,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  useDisclosure,
} from "@chakra-ui/react";
import { SubmitHandler, useForm } from "react-hook-form";
import Icon from "./Icon";

interface Props {
  handleAddItem: (itemData: Inputs) => void;
  withNumberStepper?: boolean;
}

export interface Inputs {
  name: string;
  quantity: number;
}

const NewItem = ({ handleAddItem, withNumberStepper = true }: Props) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const { register, handleSubmit, reset } = useForm<Inputs>();

  const onSubmit: SubmitHandler<Inputs> = (data) => {
    handleAddItem(data);
    reset();
  };

  return (
    <>
      <Button colorScheme="blue" size="lg" borderRadius="5px" onClick={onOpen}>
        <Icon name="FaPlus"></Icon>
      </Button>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Dodaj element</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <form onSubmit={handleSubmit(onSubmit)}>
              <FormControl>
                <Flex>
                  <Input {...register("name")}></Input>
                  {withNumberStepper ? (
                    <NumberInput defaultValue={1} min={1}>
                      <NumberInputField {...register("quantity")} />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  ) : null}
                </Flex>
              </FormControl>
              <ModalFooter>
                <Button colorScheme="blue" mr={3} type="submit">
                  Potwierdź
                </Button>
              </ModalFooter>
            </form>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default NewItem;
