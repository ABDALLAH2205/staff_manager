// @mui
import {
  Grid,
  Container,
  Box,
  Button,
  Dialog,
  TextField,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
} from '@mui/material';
// hooks
import useSettings from '../../hooks/useSettings';
// layouts
import Layout from '../../layouts';
// components
import Page from '../../components/Page';
// sections
import { BookingWidgetSummary } from '../../sections/@dashboard/general/booking';
// assets
import {
  BookingIllustration,
  CheckInIllustration,
  CheckOutIllustration,
  DocIllustration,
  MaintenanceIllustration,
  MotivationIllustration,
  OrderCompleteIllustration,
  PlanPremiumIcon,
  SentIcon,
  SeoIllustration,
} from '../../assets';
import { useEffect, useState } from 'react';
import RequestFormBase from './create-request-form/RequestFormBase';
import {
  ABSENCE_REQUEST_KEY,
  CONGESS_REQUEST_KEY,
  MATERIALS_REQUEST,
  MISSION_REQUEST_KEY,
  REQUEST_FOR_CREDIT_ON_XEROX_MULTIFUNCTION_UNITS,
  REQUEST_FOR_EXPRESSION_OF_NEEDS,
  REQUEST_FOR_ON_CALL_TIME,
  REQUEST_FOR_RETURN_TO_SERVICE,
  REQUEST_FOR_TELEPHONE_CREDIT_EXTENSION,
  VEHICLE_EXIT_REQUEST,
} from './create-request-form/ids.constant';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import { PATH_DASHBOARD } from 'src/routes/paths';

// ----------------------------------------------------------------------

GeneralBooking.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};

// ----------------------------------------------------------------------

export default function GeneralBooking() {
  const router = useRouter();

  const { themeStretch } = useSettings();
  const md = 6;

  const { user, userRequest } = useSelector((state) => state.user);

  const [open, setOpen] = useState(false);
  const [requestData, setRequestData] = useState({
    title: "Demande d'absences",
    total: "Demande d'absence",
    icon: <BookingIllustration />,
  });
  const handleClickOpen = (item) => {
    if (item) setRequestData(item);
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const BookingWidgetSummaryArray = [
    {
      id: ABSENCE_REQUEST_KEY,
      title: "Demande d'absences",
      total: "Demande d'absence",
      icon: <BookingIllustration />,
    },
    {
      id: MISSION_REQUEST_KEY,
      title: "Demande d'autorisations de missions",
      total: 311000,
      icon: <CheckOutIllustration />,
    },
    {
      id: CONGESS_REQUEST_KEY,
      title: 'Demande de départ en congés',
      total: 124000,
      icon: <CheckInIllustration />,
    },
    {
      id: REQUEST_FOR_EXPRESSION_OF_NEEDS,
      title: "Demande d'expression de besoins",
      total: 714000,
      icon: <SeoIllustration />,
    },
    {
      id: REQUEST_FOR_TELEPHONE_CREDIT_EXTENSION,
      title: 'Demande de rallonge de crédit téléphonique',
      total: 311000,
      icon: <SentIcon />,
    },
    {
      id: REQUEST_FOR_CREDIT_ON_XEROX_MULTIFUNCTION_UNITS,
      title: 'Demande de crédit sur les unités multifonctions XEROX',
      total: 124000,
      icon: <PlanPremiumIcon />,
    },
    {
      id: MATERIALS_REQUEST,
      title: 'Demande matériels',
      total: 714000,
      icon: <OrderCompleteIllustration />,
    },
    {
      id: REQUEST_FOR_RETURN_TO_SERVICE,
      title: 'Demande de reprise de service',
      total: 311000,
      icon: <MotivationIllustration />,
    },
    {
      id: VEHICLE_EXIT_REQUEST,
      title: 'Demande de sortie de véhicules',
      total: 124000,
      icon: <MaintenanceIllustration />,
    },
    {
      id: REQUEST_FOR_ON_CALL_TIME,
      title: "Demande d'heures d'astreintes",
      total: 124000,
      icon: <DocIllustration />,
    },
  ];

  useEffect(() => {
    if (router.query['new-logged'] === '1') {
      // router.replace(PATH_DASHBOARD.general.booking);

      // router.replace(window.location.pathname);
      window.location.replace(window.location.pathname);

      // router.reload();
    }
  }, [router]);

  return (
    <Page title="General: Banking">
      <Container maxWidth={themeStretch ? false : 'xl'}>
        {/* <Box sx={{ pb: 5 }}>
          {userRequest &&
            userRequest.sucess &&
            userRequest.sucessMessage &&
            setTimeout(() => {
              <Alert severity="success" sx={{ mt: 2, mb: 1 }}>
                {userRequest.sucessMessage}
              </Alert>;
            }, 5000)}
        </Box> */}

        <Grid container spacing={3}>
          {BookingWidgetSummaryArray.map((item, index) => (
            <Grid item xs={12} md={md} key={index}>
              <div sx={{ cursor: 'pointer' }} onClick={() => handleClickOpen(item)}>
                <BookingWidgetSummary {...item} />
              </div>
            </Grid>
          ))}
        </Grid>

        <RequestFormBase open={open} handleClose={handleClose} requestData={requestData} />
      </Container>
    </Page>
  );
}
