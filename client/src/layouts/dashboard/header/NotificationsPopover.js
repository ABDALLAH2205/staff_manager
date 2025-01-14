import PropTypes from 'prop-types';
import { noCase } from 'change-case';
import { useEffect, useState } from 'react';
// @mui
import {
  Box,
  List,
  Badge,
  Button,
  Avatar,
  Tooltip,
  Divider,
  Typography,
  ListItemText,
  ListSubheader,
  ListItemAvatar,
  ListItemButton,
} from '@mui/material';
// utils
import { fToNow } from '../../../utils/formatTime';
// _mock_
import { _notifications } from '../../../_mock';
// components
import Iconify from '../../../components/Iconify';
import Scrollbar from '../../../components/Scrollbar';
import MenuPopover from '../../../components/MenuPopover';
import { IconButtonAnimate } from '../../../components/animate';
import { useDispatch, useSelector } from 'react-redux';
import { getNotifications, markAllNotificationAsRead } from 'src/redux/slices/user';

// ----------------------------------------------------------------------

export default function NotificationsPopover() {
  const dispatch = useDispatch();
  const { errorNotifs, isLoadingNotifs, notifications, user } = useSelector((state) => state.user);
  const [open, setOpen] = useState(null);
  const [totalUnRead, setTotalUnRead] = useState(0);

  const handleOpen = (event) => {
    setOpen(event.currentTarget);
  };

  const handleClose = () => {
    setOpen(null);
  };

  const handleMarkAllAsRead = () => {
    dispatch(markAllNotificationAsRead());
    refreshNotifications();
    setTotalUnRead(0);
  };

  const refreshNotifications = () => {
    dispatch(getNotifications({ user_id: user.id }));
  };

  useEffect(() => {
    if (notifications && notifications.length > 0) {
      setTotalUnRead(notifications.filter((item) => item.read_at == null).length);
    }
  }, [notifications]);

  useEffect(() => {
    if (!isLoadingNotifs && !errorNotifs && !notifications && user && user.id) {
      dispatch(getNotifications({ user_id: user.id }));
    }

    if (notifications && !isLoadingNotifs) {
      const intervalId = setInterval(() => {
        refreshNotifications();
      }, 5000);

      return () => {
        clearInterval(intervalId);
      };
    }
  }, [dispatch, errorNotifs, isLoadingNotifs, notifications, refreshNotifications]);

  return (
    <>
      <IconButtonAnimate color={open ? 'primary' : 'default'} onClick={handleOpen} sx={{ width: 40, height: 40 }}>
        <Badge badgeContent={totalUnRead} color="error">
          <Iconify icon="eva:bell-fill" width={20} height={20} />
        </Badge>
      </IconButtonAnimate>

      <MenuPopover
        open={Boolean(open)}
        anchorEl={open}
        onClose={handleClose}
        sx={{ width: 360, p: 0, mt: 1.5, ml: 0.75 }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', py: 2, px: 2.5 }}>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="subtitle1">Notifications</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Vous avez {totalUnRead} notification(s) non lue(s)
            </Typography>
          </Box>

          {totalUnRead > 0 && (
            <Tooltip title="Marquer toutes les notifications comme lues">
              <IconButtonAnimate color="primary" onClick={handleMarkAllAsRead}>
                <Iconify icon="eva:done-all-fill" width={20} height={20} />
              </IconButtonAnimate>
            </Tooltip>
          )}

          <Tooltip title="Rafraichir">
            <IconButtonAnimate color="primary" onClick={() => dispatch(getNotifications({ user_id: user.id }))}>
              <Iconify icon="eva:refresh-outline" width={20} height={20} />
            </IconButtonAnimate>
          </Tooltip>
        </Box>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <Scrollbar sx={{ height: { xs: 340, sm: 'auto', md: 360, lg: 400, xl: 450 } }}>
          {notifications &&
            notifications.length > 0 &&
            notifications?.filter((notification) => notification.read_at == null).length > 0 && (
              <List
                disablePadding
                subheader={
                  <ListSubheader disableSticky sx={{ py: 1, px: 2.5, typography: 'overline' }}>
                    Nouveau
                  </ListSubheader>
                }
              >
                {notifications &&
                  notifications
                    .filter((notification) => notification.read_at == null)
                    .map((notification) => (
                      <NotificationItem key={notification.created_at} notification={notification} />
                    ))}
              </List>
            )}

          {false && notifications && notifications.length > 0 && (
            <List
              disablePadding
              subheader={
                <ListSubheader disableSticky sx={{ py: 1, px: 2.5, typography: 'overline' }}>
                  Anciens
                </ListSubheader>
              }
            >
              {notifications &&
                notifications
                  .filter((notification) => notification.read_at != null)
                  .map((notification) => <NotificationItem key={notification.id} notification={notification} />)}
            </List>
          )}
        </Scrollbar>

        <Divider sx={{ borderStyle: 'dashed' }} />

        {/* {notifications && notifications.length > 0 && (
          <Box sx={{ p: 1 }}>
            <Button fullWidth disableRipple>
              Voir tous
            </Button>
          </Box>
        )} */}
      </MenuPopover>
    </>
  );
}

// ----------------------------------------------------------------------

NotificationItem.propTypes = {
  notification: PropTypes.shape({
    createdAt: PropTypes.instanceOf(Date),
    id: PropTypes.string,
    isUnRead: PropTypes.bool,
    title: PropTypes.string,
    description: PropTypes.string,
    type: PropTypes.string,
    avatar: PropTypes.any,
  }),
};

function NotificationItem({ notification }) {
  const { avatar, title, message } = renderContent(notification);

  return (
    <ListItemButton
      sx={{
        py: 1.5,
        px: 2.5,
        mt: '1px',
        ...(notification.read_at && {
          bgcolor: 'action.selected',
        }),
      }}
    >
      <ListItemAvatar>
        <Avatar sx={{ bgcolor: 'background.neutral' }}>{avatar}</Avatar>
      </ListItemAvatar>

      <ListItemText
        primary={title}
        secondary={
          <>
            <Typography
              variant="caption"
              sx={{
                mt: 0.5,
                display: 'flex',
                alignItems: 'center',
                color: 'text.disabled',
                textAlign: 'justify',
              }}
            >
              {message}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                mt: 0.5,
                display: 'flex',
                alignItems: 'center',
                color: 'text.disabled',
              }}
            >
              <Iconify icon="eva:clock-outline" sx={{ mr: 0.5, width: 16, height: 16 }} />
              {fToNow(notification.created_at)}
            </Typography>
          </>
        }
      />
    </ListItemButton>
  );
}

// ----------------------------------------------------------------------

function renderContent(notification) {
  const title = (
    <Typography variant="subtitle2">
      {notification.title}
      <Typography component="span" variant="body2" sx={{ color: 'text.secondary' }}>
        {notification?.data?.title}
      </Typography>
    </Typography>
  );

  if (notification.type === 'order_placed') {
    return {
      avatar: (
        <img
          alt={notification.title}
          src="https://minimal-assets-api.vercel.app/assets/icons/ic_notification_package.svg"
        />
      ),
      title,
    };
  }
  if (notification.type === 'order_shipped') {
    return {
      avatar: (
        <img
          alt={notification.title}
          src="https://minimal-assets-api.vercel.app/assets/icons/ic_notification_shipping.svg"
        />
      ),
      title,
    };
  }
  if (notification.type === 'mail') {
    return {
      avatar: (
        <img
          alt={notification.title}
          src="https://minimal-assets-api.vercel.app/assets/icons/ic_notification_mail.svg"
        />
      ),
      title,
    };
  }
  if (notification.type === 'chat_message') {
    return {
      avatar: (
        <img
          alt={notification.title}
          src="https://minimal-assets-api.vercel.app/assets/icons/ic_notification_chat.svg"
        />
      ),
      title,
    };
  }
  return {
    avatar: notification.avatar ? <img alt={notification.title} src={notification.avatar} /> : null,
    title,
  };
}
