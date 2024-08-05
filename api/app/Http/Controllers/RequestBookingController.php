<?php

namespace App\Http\Controllers;

use App\Http\Resources\RequestResource;
use Illuminate\Http\Request;
use App\Models\Property;
use App\Models\RequestModel;
use App\Services\NotificationService;
use App\Services\ProudctPaginationService;
use App\Services\ResponseService;
use App\Utils\Utils;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Validator;

class RequestBookingController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function get(Request $request)
    {
        $user_id = $request->user_id;
        $requests = $user_id
            ? RequestModel::where('user_id', $user_id)->whereNotIn('status', [Utils::STATE_DELETED()])->get()
            : RequestModel::orderBy('id', 'desc')->get();
        $requests = $requests ? RequestResource::collection($requests) : collect();

        return ResponseService::success($requests, Response::HTTP_OK);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'id' => 'nullable|integer|exists:requests,id',
            // 'nomemp' => 'nullable|string',
            // 'premp' => 'nullable|string',
            // 'matemp' => 'nullable|string',
            // 'foncemp' => 'nullable|string',
            // 'email' => 'nullable|email',
            'user_id' => 'nullable|integer|exists:users,id',
            'mission' => 'nullable|string',
            'status' => 'nullable|string|in:PENDING,ACTIVE,INACTIVE,DELETED,REJECTED,BLOCKED',
            'location' => 'nullable|string',
            'desciption' => 'nullable|string',
            'object' => 'nullable|string',
            'startDate' => 'nullable|string',
            'endDate' => 'nullable|string',
            'motif' => 'nullable|string',
            'reject_reason' => 'nullable|string',
            'request_type' => 'required|string',
        ]);

        if ($validator->fails()) {
            return ResponseService::error(
                "Erreur d'enregistrement : " . implode(', ', $validator->errors()->all()),
                422,
                $validator->errors()
            );
        }

        // Enregistrer les données dans la base de données
        $validatedData = $validator->validated();

        if (isset($validatedData['id'])) {
            // ? UPDATE
            $demande = RequestModel::find($validatedData['id']);
            $demande->fill($validatedData);

            // $demande->startDate = $demande->startDate;
            // $demande->endDate = $demande->endDate;

            $demande->status = $validatedData['status'] ?? $demande->status;
            $demande->updated_by = auth()->user()->id;
            // dd($demande);
            $demande->update();
            NotificationService::afterUpdateRequest($demande->refresh());
        } else {
            // ? CREATION
            $demande = new RequestModel();
            $demande->fill($validatedData);
            $demande->status = 'PENDING';
            $demande->updated_by = auth()->user()->id;
            $demande->save();

            // Envoyer une notification
            NotificationService::afterCreateRequest($demande);
        }

        return ResponseService::success($demande->refresh(), "Store successfully");
    }


    /**
     * Delete a request from the database.
     *
     * @param Request $request The HTTP request containing the request ID.
     * @return \Illuminate\Http\JsonResponse The JSON response indicating the success or failure of the deletion.
     */
    public function delete(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'id' => 'required|integer|exists:requests,id',
        ]);

        if ($validator->fails()) {
            return ResponseService::error(
                "Demande non trouvée " . implode(', ', $validator->errors()->all()),
                404,
                $validator->errors()
            );
        }

        // Enregistrer les données dans la base de données
        $validatedData = $validator->validated();

        if (isset($validatedData['id'])) {
            $demande = RequestModel::find($validatedData['id']);
            $demande->status = Utils::STATE_DELETED();
            $demande->updated_by = auth()->user()->id;
            $demande->update($validatedData);
        }

        return ResponseService::success([], "Suppression effectuée avec succès");
    }
}
