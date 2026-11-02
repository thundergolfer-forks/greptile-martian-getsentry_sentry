import {ProjectAvatar} from '@sentry/scraps/avatar';

import {
  DrawerBreadcrumbs,
  EventDrawerBody,
  EventDrawerContainer,
  EventDrawerHeader,
  EventNavigator,
  Header,
} from 'sentry/components/events/eventDrawer';
import {t} from 'sentry/locale';
import type {Project} from 'sentry/types/project';
import {GroupSimilarIssues} from 'sentry/views/issueDetails/groupSimilarIssues/similarIssues';

export function SimilarIssuesDrawer({project}: {project: Project}) {
  return (
    <EventDrawerContainer>
      <EventDrawerHeader>
        <DrawerBreadcrumbs
          current={{
            label: t('Similar Issues'),
            leadingGraphic: <ProjectAvatar project={project} size={16} />,
          }}
        />
      </EventDrawerHeader>
      <EventNavigator>
        <Header>{t('Similar Issues')}</Header>
      </EventNavigator>
      <EventDrawerBody>
        <GroupSimilarIssues />
      </EventDrawerBody>
    </EventDrawerContainer>
  );
}
