import { Modal } from "./Modal";
import { useModal } from "./navStore";
import { MODAL_FEATURES } from "./modules";
import { renderFeature } from "./FeatureRenderer";

export const FeatureModal = () => {
  const { moduleId, featureId, close } = useModal();
  const open = !!(moduleId && featureId);
  const meta = open ? MODAL_FEATURES[`${moduleId}.${featureId}`] : undefined;

  return (
    <Modal isOpen={open} onClose={close} title={meta?.title}>
      {open && (
        <div className="[&_.fade-in]:animate-none">
          {/* Hide the inner SectionHeader since the modal already has a title */}
          <div className="[&>div>h1]:hidden [&>div>p.text-sm]:hidden">
            {renderFeature(moduleId!, featureId!)}
          </div>
        </div>
      )}
    </Modal>
  );
};
