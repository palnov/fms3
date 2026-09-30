import * as migration_20260902_111511_initial_payload from './20260902_111511_initial_payload';
import * as migration_20260902_112647_add_home_content from './20260902_112647_add_home_content';
import * as migration_20260904_090000_add_tool_step_keys from './20260904_090000_add_tool_step_keys';
import * as migration_20260930_135327_20260930_add_page_hierarchy from './20260930_135327_20260930_add_page_hierarchy';

export const migrations = [
  {
    up: migration_20260902_111511_initial_payload.up,
    down: migration_20260902_111511_initial_payload.down,
    name: '20260902_111511_initial_payload',
  },
  {
    up: migration_20260902_112647_add_home_content.up,
    down: migration_20260902_112647_add_home_content.down,
    name: '20260902_112647_add_home_content',
  },
  {
    up: migration_20260904_090000_add_tool_step_keys.up,
    down: migration_20260904_090000_add_tool_step_keys.down,
    name: '20260904_090000_add_tool_step_keys',
  },
  {
    up: migration_20260930_135327_20260930_add_page_hierarchy.up,
    down: migration_20260930_135327_20260930_add_page_hierarchy.down,
    name: '20260930_135327_20260930_add_page_hierarchy'
  },
];
