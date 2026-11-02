import {
  DrawerBreadcrumbs,
  EventDrawerBody,
  EventDrawerContainer,
  EventDrawerHeader,
  EventNavigator,
  Header,
} from 'sentry/components/events/eventDrawer';
import {t} from 'sentry/locale';
import {GroupSimilarIssues} from 'sentry/views/issueDetails/groupSimilarIssues/similarIssues';

export function SimilarIssuesDrawer() {
  return (
    <EventDrawerContainer>
      <EventDrawerHeader>
        <DrawerBreadcrumbs
          current={{
            label: t('Similar Issues'),
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
