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
}

export interface Inputs {
  name: string;
  quantity: number;
}

const NewItem = ({ handleAddItem }: Props) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const { register, handleSubmit } = useForm<Inputs>();

  const onSubmit: SubmitHandler<Inputs> = (data) => {
    handleAddItem(data);
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
                  <NumberInput defaultValue={1} min={1}>
                    <NumberInputField {...register("quantity")} />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
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
