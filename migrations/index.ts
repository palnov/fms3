import * as migration_20260902_111511_initial_payload from './20260902_111511_initial_payload';
import * as migration_20260902_112647_add_home_content from './20260902_112647_add_home_content';

export const migrations = [
  {
    up: migration_20260902_111511_initial_payload.up,
    down: migration_20260902_111511_initial_payload.down,
    name: '20260902_111511_initial_payload',
  },
  {
    up: migration_20260902_112647_add_home_content.up,
    down: migration_20260902_112647_add_home_content.down,
    name: '20260902_112647_add_home_content'
  },
];
