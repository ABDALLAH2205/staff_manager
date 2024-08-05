import React, { useEffect } from 'react';
// @mui
import {
  Button,
  Dialog,
  TextField,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Grid,
  Alert,
  CircularProgress,
} from '@mui/material';
import AbsenceRequests from './AbsenceRequests';
import PropTypes from 'prop-types';
import { Stack } from 'immutable';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import useIsMountedRef from 'src/hooks/useIsMountedRef';
import { useSnackbar } from 'notistack';
import { RHFTextField } from 'src/components/hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import {
  ABSENCE_REQUEST_KEY,
  ACTION_UPDATE,
  CONGESS_REQUEST_KEY,
  MATERIALS_REQUEST,
  MISSION_REQUEST_KEY,
  REQUEST_FOR_CREDIT_ON_XEROX_MULTIFUNCTION_UNITS,
  REQUEST_FOR_EXPRESSION_OF_NEEDS,
  REQUEST_FOR_ON_CALL_TIME,
  REQUEST_FOR_RETURN_TO_SERVICE,
  REQUEST_FOR_TELEPHONE_CREDIT_EXTENSION,
  VEHICLE_EXIT_REQUEST,
} from './ids.constant';
import { getUserRequests, initUserRequest, saveUserRequest } from 'src/redux/slices/user';
import { DatePicker, DateTimePicker } from '@mui/lab';
import RHFDatePicker from 'src/components/hook-form/RHFDatePicker';

function RequestFormBase({ open, handleClose, requestData }) {
  const isMountedRef = useIsMountedRef();

  const { enqueueSnackbar } = useSnackbar();
  const dispatch = useDispatch();
  const router = useRouter();
  const { user, userRequest } = useSelector((state) => state.user);

  const FormSchema = Yup.object().shape({
    // basic fields
    nomemp: Yup.string().required('Le nom est obligatoire'),
    premp: Yup.string(),
    matemp: Yup.string().required('Le matricule est obligatoire'),
    foncemp: Yup.string(),
    email: Yup.string(), // .email('Email must be a valid email address').required('Email is required')

    // addons fields
    location: Yup.string(),
    desciption: Yup.string(),
    object: Yup.string(),

    startDate: Yup.string(),
    endDate: Yup.string(),
    motif: Yup.string(),
  });

  const defaultValues = {
    nomemp: user && user?.nomemp ? user?.nomemp : '',
    premp: user && user?.premp ? user?.premp : '',
    matemp: user && user?.matemp ? user?.matemp : '',
    foncemp: user && user?.foncemp ? user?.foncemp : '',
    email: user && user?.email ? user?.email : '',

    location: userRequest && userRequest.data ? userRequest.data.location : '',
    desciption: userRequest && userRequest.data ? userRequest.data.desciption : '',
    object: userRequest && userRequest.data ? userRequest.data.object : '',

    startDate: userRequest && userRequest.data ? userRequest.data.startDate : '',
    endDate: userRequest && userRequest.data ? userRequest.data.endDate : '',
    motif: userRequest && userRequest.data ? userRequest.data.motif : '',
  };

  const methods = useForm({ resolver: yupResolver(FormSchema), defaultValues });

  const {
    reset,
    setError,
    control,
    setValue,
    handleSubmit,
    formState: { errors, isSubmitting, isSubmitted, isValid },
  } = methods;

  const convertDateToTimeStamp = (date) => {
    const timestamp = new Date(date).getTime();
    if (timestamp) {
      return timestamp;
    }
    return date;
  };

  /**
   * Submits the form data asynchronously.
   *
   * @param {Object} data - The form data to be submitted.
   * @return {Promise<void>} A promise that resolves when the submission is complete.
   */
  const onSubmit = async (data) => {
    try {
      // saveUserRequest(formatData(data));
      dispatch(saveUserRequest(formatData(data)));
      //   handleClose();
    } catch (error) {
      console.error(error);
      if (isMountedRef.current) {
        setError('afterSubmit', { ...error, message: error.message });
      }
    }
  };

  /**
   * Returns a new object with the properties of the input data object,
   * along with an additional property "id" set to the value of the user's id.
   * Throws an error if the user or requestData is null.
   *
   * @param {Object} data - The input data object.
   * @return {Object} The new object with the formatted data.
   * @throws {Error} If user or requestData is null.
   */
  const formatData = (data) => {
    if (!user || !requestData) {
      throw new Error('Invalid user or requestData');
    }

    // console.table(data);
    if (data.startDate && data.endDate) {
      if (data.startDate > data.endDate) {
        enqueueSnackbar('La date de début doit être inférieure à la date de fin', { variant: 'error' });
        return;
      }
    }

    if (!requestData?.id) {
      enqueueSnackbar('Erreur du type de requête', { variant: 'error' });
    }

    if (data.startDate || data.endDate) {
      data.startDate = `${convertDateToTimeStamp(data.startDate)}`;
      data.endDate = `${convertDateToTimeStamp(data.endDate)}`;
    }

    console.log({
      startDate: data.startDate,
      endDate: data.endDate,
    });

    return {
      ...data,
      user_id: user?.id,
      request_type: requestData?.id ?? null,
      id: requestData?.data?.id ?? null,
    };
  };

  /**
   * Checks if the function can be shown based on the requestData.
   *
   * @return {boolean} Returns true if the requestData is not MISSION_REQUEST_KEY or ABSENCE_REQUEST_KEY, otherwise returns false.
   */
  const canShowFunction = () => {
    if (!requestData) {
      return false;
    }

    return (
      requestData?.id !== MISSION_REQUEST_KEY &&
      requestData?.id !== ABSENCE_REQUEST_KEY &&
      requestData?.id !== CONGESS_REQUEST_KEY &&
      requestData?.id !== REQUEST_FOR_EXPRESSION_OF_NEEDS
    );
  };

  const canShowMatricule = () => {
    if (!requestData) {
      return false;
    }

    return (
      requestData?.id !== MISSION_REQUEST_KEY &&
      requestData?.id !== ABSENCE_REQUEST_KEY &&
      requestData?.id !== CONGESS_REQUEST_KEY &&
      requestData?.id !== REQUEST_FOR_EXPRESSION_OF_NEEDS
    );
  };

  const canShowEmail = () => {
    return requestData && requestData?.id != MISSION_REQUEST_KEY;
  };

  const canShowDate = () => {
    if (!requestData) {
      return false;
    }

    return isAbsenceRequest() || isCongeRequest() || isRequestReturnToService();
  };

  const canShowDateTime = () => {
    if (!requestData) {
      return false;
    }

    return isRequestVehicleExit() || isRequestOnCallTime();
  };

  const canShowMotif = () => {
    if (!requestData) {
      return false;
    }

    return (
      // isMissionRequest() ||
      isCongeRequest() ||
      isAbsenceRequest() ||
      isRequestCreditExtension() ||
      isRequestTelephoneCreditExtension() ||
      isRequestReturnToService() ||
      isRequestVehicleExit() ||
      isRequestOnCallTime() ||
      isRequestExpressionNeeds() ||
      isMaterialRequest()
    );
  };

  const isMissionRequest = () => requestData && requestData?.id == MISSION_REQUEST_KEY;

  const isAbsenceRequest = () => requestData && requestData?.id == ABSENCE_REQUEST_KEY;

  const isCongeRequest = () => requestData && requestData?.id == CONGESS_REQUEST_KEY;

  const isRequestExpressionNeeds = () => requestData && requestData?.id === REQUEST_FOR_EXPRESSION_OF_NEEDS;

  const isRequestCreditExtension = () =>
    requestData && requestData?.id === REQUEST_FOR_CREDIT_ON_XEROX_MULTIFUNCTION_UNITS;

  const isRequestTelephoneCreditExtension = () =>
    requestData && requestData?.id === REQUEST_FOR_TELEPHONE_CREDIT_EXTENSION;

  const isRequestReturnToService = () => requestData && requestData?.id === REQUEST_FOR_RETURN_TO_SERVICE;

  const isRequestVehicleExit = () => requestData && requestData?.id === VEHICLE_EXIT_REQUEST;

  const isRequestOnCallTime = () => requestData && requestData?.id === REQUEST_FOR_ON_CALL_TIME;

  const isMaterialRequest = () => requestData && requestData?.id === MATERIALS_REQUEST;

  // * On success of request
  useEffect(() => {
    if (userRequest && !userRequest.isLoading && userRequest.actionType === ACTION_UPDATE && isSubmitted) {
      if (userRequest.success) {
        enqueueSnackbar('Demande envoyée avec succès', { variant: 'success' });
        dispatch(initUserRequest());
        reset();
        if (requestData && requestData.data?.id) {
          // TODO : use useEffect to single fetchAll
          const payload = user && !user?.isAdmin && user?.id ? `?user_id=${user?.id}` : '';
          dispatch(getUserRequests(payload));
        }
        handleClose();
      }
    }
  }, [userRequest, enqueueSnackbar, dispatch, handleClose, isSubmitted, reset, requestData, user]);

  // ! on error in request
  useEffect(() => {
    if (userRequest && !userRequest.isLoading && userRequest.actionType === ACTION_UPDATE && isSubmitted) {
      if (userRequest.error) {
        enqueueSnackbar(userRequest.error, { variant: 'error' });
      }
    }
  }, [userRequest, enqueueSnackbar, isSubmitted]);

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Dialog maxWidth="md" fullWidth={true} open={open} onClose={handleClose}>
          <DialogTitle> {requestData && requestData.title} </DialogTitle>

          {!isValid && console.log(errors)}

          <DialogContent>
            <DialogContentText>
              {!!errors.afterSubmit && <Alert severity="error">{errors.afterSubmit.message}</Alert>}
              {userRequest && userRequest.error && (
                <Alert severity="error" sx={{ mt: 2, mb: 1 }}>
                  {userRequest.error}
                </Alert>
              )}
            </DialogContentText>

            <Grid container spacing={3} mt={3}>
              <Grid item xs={12} md={6} lg={6}>
                <RHFTextField name="premp" label="Prenoms" disabled />
              </Grid>

              <Grid item xs={12} md={6} lg={6}>
                <RHFTextField name="nomemp" label="Nom" disabled />
              </Grid>

              {canShowFunction() && (
                <Grid item xs={12} md={6} lg={6}>
                  <RHFTextField name="foncemp" label="Fonction" disabled />
                </Grid>
              )}

              {canShowMatricule() && (
                <Grid item xs={12} md={6} lg={6}>
                  <RHFTextField name="matemp" label="Matricule" disabled />
                </Grid>
              )}

              {canShowDate() && (
                <>
                  <Grid item xs={12} md={6} lg={6}>
                    <RHFDatePicker
                      name="startDate"
                      label="Date de depart"
                      inputFormat="dd/MM/yyyy"
                      defaultValue={
                        requestData && requestData.data ? new Date(parseInt(requestData.data.startDate)) : new Date()
                      }
                    />
                  </Grid>

                  <Grid item xs={12} md={6} lg={6}>
                    <RHFDatePicker
                      name="endDate"
                      label="Date de retour"
                      inputFormat="dd/MM/yyyy"
                      defaultValue={
                        requestData && requestData.data ? new Date(parseInt(requestData.data.endDate)) : new Date()
                      }
                    />
                  </Grid>
                </>
              )}

              {canShowDateTime() && (
                <>
                  <Grid item xs={12} md={6} lg={6}>
                    <RHFDatePicker
                      name="startDate"
                      label="Date de depart"
                      inputFormat="dd/MM/yyyy H:mm:ss "
                      defaultValue={
                        requestData && requestData.data ? new Date(parseInt(requestData.data.startDate)) : new Date()
                      }
                    />
                  </Grid>

                  <Grid item xs={12} md={6} lg={6}>
                    <RHFDatePicker
                      name="endDate"
                      label="Date et heure de arrivée"
                      inputFormat="dd/MM/yyyy H:mm:ss"
                      defaultValue={
                        requestData && requestData.data ? new Date(parseInt(requestData.data.endDate)) : new Date()
                      }
                    />
                  </Grid>
                </>
              )}

              {canShowEmail() && (
                <Grid item xs={12} md={12} lg={12}>
                  <RHFTextField name="email" label="Email" disabled />
                </Grid>
              )}

              {canShowMotif() && (
                <Grid item xs={12} md={12} lg={12}>
                  <RHFTextField
                    name="motif"
                    label="Motif"
                    defaultValue={(requestData && requestData.data && requestData.data.motif) || ''}
                  />
                </Grid>
              )}

              {isMissionRequest() && (
                <>
                  <Grid item xs={12} md={6} lg={6}>
                    <RHFTextField
                      name="location"
                      label="Lieu de mission"
                      defaultValue={(requestData && requestData.data && requestData.data.location) || ''}
                    />
                  </Grid>

                  <Grid item xs={12} md={6} lg={6}>
                    <RHFTextField
                      name="desciption"
                      label="But de la mission"
                      defaultValue={(requestData && requestData.data && requestData.data.desciption) || ''}
                    />
                  </Grid>

                  <Grid item xs={12} md={12}>
                    <RHFTextField
                      name="object"
                      label="Interêt de la mission"
                      // multiline
                      // rows={4}
                      defaultValue={(requestData && requestData.data && requestData.data.object) || ''}
                    />
                  </Grid>
                </>
              )}
            </Grid>
          </DialogContent>

          <DialogActions>
            {userRequest.isLoading  ? (
              <CircularProgress />
            ) : (
              <>
                <Button
                  onClick={() => {
                    handleClose();
                    reset();
                  }}
                  color="inherit"
                >
                  Annuler
                </Button>

                <Button
                  type="submit"
                  onClick={handleSubmit(onSubmit)}
                  disabled={isSubmitting || !isValid}
                  variant="contained"
                >
                  {requestData && requestData.data && requestData.data.id
                    ? 'Modifier la demande'
                    : 'Envoyer la demande'}
                </Button>
              </>
            )}
          </DialogActions>
        </Dialog>
      </form>
    </FormProvider>
  );
}

RequestFormBase.propTypes = {
  open: PropTypes.bool,
  handleClose: PropTypes.func,
  requestData: PropTypes.object,
};

export default RequestFormBase;
