<?php

namespace App\Services;

use App\Models\RequestModel;
use App\Models\User;
use App\Notifications\Notifications;

class NotificationService
{
    public static  function getUserRequestType($demandeType)
    {
        $output = "";
        switch ($demandeType) {
            case "MISSION_REQUEST":
                $output = "demande de Mission";
                break;

            case "ABSENCE_REQUEST":
                $output = "demande d'absence";
                break;

            case "CONGES_REQUEST":
                $outup = "demande de conges";
                break;

            case "REQUEST_FOR_EXPRESSION_OF_NEEDS":
                $output = "demande d'expression de besoin";
                break;

            case "REQUEST_FOR_TELEPHONE_CREDIT_EXTENSION":
                $output = "extension de credit de telephone";
                break;

            case "REQUEST_FOR_CREDIT_ON_XEROX_MULTIFUNCTION_UNITS":
                $outup = "credit sur les unite de fonction xerox";
                break;

            case "MATERIALS_REQUEST":
                $output = "demande de materiel";
                break;

            case "REQUEST_FOR_RETURN_TO_SERVICE":
                $outup = "demande de retour au service";
                break;

            case "VEHICLE_EXIT_REQUEST":
                $output = "demande de sortie de vehicule";
                break;

            case "REQUEST_FOR_ON_CALL_TIME":
                $output = "demande d'heure de presence";
                break;

            default:
                $output = $demandeType;
                break;
        }

        return $output;
    }

    public static function getStausName($statut)
    {
        switch ($statut) {
            case "PENDING":
                return "En attente";
            case "ACTIVE":
                return "Acceptée";
            case "INACTIVE":
                return "Inactif";
            case "DELETED":
                return "Supprimé";
            case "REJECTED":
                return "Rejetée";
            case "BLOCKED":
                return "Bloquée";
            default:
                return "";
        }
    }

    /**
     * Sends a notification after creating a request.
     *
     * @param RequestModel $demande The request model object.
     * @throws \Throwable If an error occurs during the notification process.
     * @return void
     */
    public static function afterCreateRequest(RequestModel $demande)
    {
        // Envoyer une notification
        try {
            $demande->refresh();
            $notifiRequestName = $demande->mission ?? $demande->object ?? $demande->motif ?? '';
            NotificationService::notify(
                auth()->user(),
                'Votre ' . NotificationService::getUserRequestType($demande->request_type) . ' a été envoyée, les adminsitrateurs traiteront votre demande dans les plus bref delais',
                'Merci pour votre ' . NotificationService::getUserRequestType($demande->request_type) . ' , nous traitons votre demande',
                [
                    'title' => "Nouvelle " . NotificationService::getUserRequestType($demande->request_type) . " en attente, par l'employé : " . auth()->user()->premp . " " . auth()->user()->nomemp,
                    'message' => 'Une nouvelle demande a été soumise : '  . $notifiRequestName,
                ]
            );
        } catch (\Throwable $th) {
            //throw $th;
        }
    }

    /**
     * Envoyer une notification
     *
     * @param RequestModel $demande description
     * @throws \Throwable description of exception
     * @return void
     */
    public static function afterUpdateRequest(RequestModel $demande)
    {
        // Envoyer une notification
        $user = User::find($demande->user_id);
        // dd($user);
        if ($user === null) {
            // User not found, log or handle the error
            return;
        }

        try {
            // $demande->refresh();
            // $notifiRequestName = $demande->mission ?? $demande->object ?? $demande->motif ?? '';
            $title = 'Votre ' . NotificationService::getUserRequestType($demande->request_type) . ' a été modifiée, votre demande est ' . NotificationService::getStausName($demande->status);
            if ($demande->status == 'REJECTED') {
                $title = 'Votre ' . NotificationService::getUserRequestType($demande->request_type) . ' a été rejeté, en raison de : ' . $demande->reject_reason;
            }

            NotificationService::notify(
                $user,
                $title,
                'Votre ' . NotificationService::getUserRequestType($demande->request_type) . ' , a été modifiée',
                [
                    'title' => "La " . NotificationService::getUserRequestType($demande->request_type) . ", soumise par l'employé : " . $user->premp . " " . $user->nomemp . " a été modifiée ",
                    'message' => 'Mise à jour effectuée',
                ]
            );
        } catch (\Throwable $th) {
            // Log or handle the exception
            //throw $th;
        }
    }


    public static function notify(
        User $user,
        string $title = '',
        string $message = '',
        ?array $notifyAdmins = null
    ) {
        if ($notifyAdmins != null && isset($notifyAdmins['title']) && isset($notifyAdmins['message'])) {
            static::notifyAdmins($notifyAdmins['title'], $notifyAdmins['message']);
        }
        $user->notify(new Notifications($title, $message, ['user_id' => $user->id]));
    }

    public static function notifyAdmins(string $title = '', string $message = '')
    {
        foreach (User::where('type', 'ADMIN')->get() as $admin) {
            static::notify($admin, $title, $message);
        }
    }

    public static function notifyUsers(
        string $title = '',
        string $message = '',
        ?array $notifyAdmins = null
    ) {
        if ($notifyAdmins != null && isset($notifyAdmins['title']) && isset($notifyAdmins['message'])) {
            static::notifyAdmins($notifyAdmins['title'], $notifyAdmins['message']);
        }

        foreach (User::where('type', 'EMPLOYEE')->get() as $user) {
            static::notify($user, $title, $message);
        }
    }
}
