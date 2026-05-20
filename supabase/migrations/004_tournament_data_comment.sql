-- Documents what lives inside tournaments.data (jsonb). Safe to run anytime.

comment on column public.tournaments.data is
  'Full Scrim Command snapshot: tournament id/name/activeMatchId/timestamps; teams[] with id, name, optional tag, optional logoDataUrl (JPEG data URL), optional players[{id,name,gender: boy|girl}]; matches[] with id, label, order, results map teamId -> {placement, kills, optional playerKills map playerId -> number}.';
