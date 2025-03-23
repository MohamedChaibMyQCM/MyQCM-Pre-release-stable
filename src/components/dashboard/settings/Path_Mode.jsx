import IntelligentMode from "./IntelligentMode";
import GuidedMode from "./GuidedMode";
import CustomMode from "./CustomMode";

const Path_Mode = ({ selectedMode, settings, onChange }) => {
  return (
    <div className="mt-8">
      {selectedMode === "intelligent" && (
        <IntelligentMode
          settings={settings}
          onChange={(field, value) => onChange(field, value)}
        />
      )}
      {selectedMode === "guided" && (
        <GuidedMode
          settings={settings}
          onChange={(field, value) => onChange(field, value)}
        />
      )}
      {selectedMode === "custom" && (
        <CustomMode
          settings={settings}
          onChange={(field, value) => onChange(field, value)}
        />
      )}
    </div>
  );
};

export default Path_Mode;
