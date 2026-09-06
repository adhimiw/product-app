<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ContactQuery;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ContactController extends Controller
{
    /**
     * POST /api/contact
     * Submit a contact inquiry/query from the storefront.
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name'    => 'required|string|max:150',
            'email'   => 'required|email|max:150',
            'phone'   => 'nullable|string|max:30',
            'subject' => 'nullable|string|max:200',
            'message' => 'required|string|min:5|max:5000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status'  => false,
                'message' => 'Validation error',
                'errors'  => $validator->errors(),
            ], 422);
        }

        $validated = $validator->validated();

        $query = ContactQuery::create([
            'name'       => trim($validated['name']),
            'email'      => trim(strtolower($validated['email'])),
            'phone'      => isset($validated['phone']) ? trim($validated['phone']) : null,
            'subject'    => isset($validated['subject']) ? trim($validated['subject']) : 'General Inquiry',
            'message'    => trim($validated['message']),
            'status'     => 'pending',
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'status'  => true,
            'message' => 'Your message has been received successfully. Our team will get back to you soon!',
            'data'    => [
                'id'         => $query->id,
                'name'       => $query->name,
                'email'      => $query->email,
                'status'     => $query->status,
                'created_at' => $query->created_at->toIso8601String(),
            ],
        ], 201);
    }
}
