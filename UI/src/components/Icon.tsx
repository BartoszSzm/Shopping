import * as ReactIcons from "react-icons/fa";

export type IconName = keyof typeof ReactIcons;

interface Props {
  name: IconName;
}

const Icon = ({ name }: Props) => {
  const IconComponent = ReactIcons[name];
  if (IconComponent) {
    return <IconComponent />;
  } else {
    const QuestionmarkIcon = ReactIcons["FaRegQuestionCircle"];
    return <QuestionmarkIcon />;
  }
};

export default Icon;
