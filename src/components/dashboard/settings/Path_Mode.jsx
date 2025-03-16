import IntelligentMode from "./IntelligentMode";
import GuidedMode from "./GuidedMode";
import CustomMode from "./CustomMode";

const Path_Mode = ({ selectedMode, name, value, setFieldValue }) => {
  return (
    <div className="mt-8">
      {selectedMode === "intelligent" && <IntelligentMode />}
      {selectedMode === "guided" && (
        <GuidedMode name={name} value={value} setFieldValue={setFieldValue} />
      )}
      {selectedMode === "custom" && (
        <CustomMode name={name} value={value} setFieldValue={setFieldValue} />
      )}
    </div>
  );
};

export default Path_Mode;
