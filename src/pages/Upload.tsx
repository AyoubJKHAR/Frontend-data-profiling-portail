import { useAnalysis } from "../contexts/AnalysisContext";
import ProfilingUpload from "../components/analysis/ProfilingUpload/ProfilingUpload";
import RulesGeneratorUpload from "../components/analysis/RulesGenerator/RulesGeneratorUpload";
import CodeGeneratorUpload from "../components/analysis/CodeGenerator/CodeGeneratorUpload";

export default function Upload() {
    const { selectedType } = useAnalysis();

    const renderContent = () => {
        switch (selectedType) {
            case "Profiling":
                return <ProfilingUpload />;
            case "Rules Generator":
                return <RulesGeneratorUpload />;
            case "Code Generator":
                return <CodeGeneratorUpload />;
            default:
                return (
                    <p style={{ color: "#FFD700" }}>
                    Veuillez sélectionner un type d’analyse depuis la barre de navigation.
                    </p>
                );
        }
    };


    return (
        <div style={{ padding: 20 }}>
            <h1 style={{ marginBottom: 20, color: "#000" }}>
                Portail de — <span style={{ color: "#FFD700" }}>{selectedType ?? "?"}</span>
            </h1>
            {renderContent()}
        </div>
    );
}