import { Navigate, useParams } from "react-router-dom";
import { TournamentProvider } from "../state/TournamentContext";
import App from "../App";

export function TournamentEditorPage() {
  const { tournamentId } = useParams();
  if (!tournamentId) return <Navigate to="/" replace />;

  return (
    <TournamentProvider key={tournamentId} persist={{ mode: "remote", tournamentId }}>
      <App />
    </TournamentProvider>
  );
}
