<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\ContactQuery;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ContactQueryController extends Controller
{
    /**
     * GET /api/admin/queries
     * Fetch list of customer queries with stats, filtering, search, and sorting.
     */
    public function index(Request $request): JsonResponse
    {
        $status = $request->query('status');
        $search = $request->query('search');
        $sort = $request->query('sort', 'latest');

        $query = ContactQuery::query();

        // Search
        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%")
                  ->orWhere('subject', 'like', "%{$search}%")
                  ->orWhere('message', 'like', "%{$search}%");
            });
        }

        // Status Filter
        if (!empty($status) && $status !== 'all') {
            $query->where('status', $status);
        }

        // Sorting
        if ($sort === 'oldest') {
            $query->orderBy('created_at', 'asc');
        } else {
            $query->orderBy('created_at', 'desc');
        }

        $items = $query->get();

        // Calculate summary counts
        $counts = [
            'all'         => ContactQuery::count(),
            'pending'     => ContactQuery::where('status', 'pending')->count(),
            'in_progress' => ContactQuery::where('status', 'in_progress')->count(),
            'resolved'    => ContactQuery::where('status', 'resolved')->count(),
            'archived'    => ContactQuery::where('status', 'archived')->count(),
        ];

        return response()->json([
            'status'  => true,
            'message' => 'Customer queries retrieved successfully',
            'data'    => $items,
            'counts'  => $counts,
        ]);
    }

    /**
     * GET /api/admin/queries/{id}
     * Get specific query details.
     */
    public function show($id): JsonResponse
    {
        $query = ContactQuery::find($id);

        if (!$query) {
            return response()->json([
                'status'  => false,
                'message' => 'Query not found',
            ], 404);
        }

        return response()->json([
            'status'  => true,
            'message' => 'Query details retrieved',
            'data'    => $query,
        ]);
    }

    /**
     * PUT /api/admin/queries/{id}/status
     * Update query status and optional admin notes.
     */
    public function updateStatus(Request $request, $id): JsonResponse
    {
        $query = ContactQuery::find($id);

        if (!$query) {
            return response()->json([
                'status'  => false,
                'message' => 'Query not found',
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'status'      => 'required|in:pending,in_progress,resolved,archived',
            'admin_notes' => 'nullable|string|max:2000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status'  => false,
                'message' => 'Invalid status value',
                'errors'  => $validator->errors(),
            ], 422);
        }

        $query->status = $request->input('status');
        if ($request->has('admin_notes')) {
            $query->admin_notes = $request->input('admin_notes');
        }
        $query->save();

        return response()->json([
            'status'  => true,
            'message' => "Query status updated to {$query->status}",
            'data'    => $query,
        ]);
    }

    /**
     * DELETE /api/admin/queries/{id}
     * Delete a query.
     */
    public function destroy($id): JsonResponse
    {
        $query = ContactQuery::find($id);

        if (!$query) {
            return response()->json([
                'status'  => false,
                'message' => 'Query not found',
            ], 404);
        }

        $query->delete();

        return response()->json([
            'status'  => true,
            'message' => 'Query deleted successfully',
        ]);
    }

    /**
     * POST /api/admin/queries/bulk-status
     * Bulk update status for multiple queries.
     */
    public function bulkStatus(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'ids'    => 'required|array|min:1',
            'ids.*'  => 'integer',
            'status' => 'required|in:pending,in_progress,resolved,archived',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status'  => false,
                'message' => 'Invalid parameters',
                'errors'  => $validator->errors(),
            ], 422);
        }

        $ids = $request->input('ids');
        $status = $request->input('status');

        ContactQuery::whereIn('id', $ids)->update(['status' => $status]);

        return response()->json([
            'status'  => true,
            'message' => count($ids) . " queries updated to {$status}",
        ]);
    }

    /**
     * POST /api/admin/queries/bulk-delete
     * Bulk delete multiple queries.
     */
    public function bulkDestroy(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'ids'   => 'required|array|min:1',
            'ids.*' => 'integer',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status'  => false,
                'message' => 'Invalid parameters',
                'errors'  => $validator->errors(),
            ], 422);
        }

        $ids = $request->input('ids');
        ContactQuery::whereIn('id', $ids)->delete();

        return response()->json([
            'status'  => true,
            'message' => count($ids) . ' queries deleted successfully',
        ]);
    }

    /**
     * POST /api/admin/queries/{id}/reply
     * Send email reply to customer and update status.
     */
    public function reply(Request $request, $id): JsonResponse
    {
        $query = ContactQuery::find($id);

        if (!$query) {
            return response()->json([
                'status'  => false,
                'message' => 'Query not found',
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'subject'     => 'required|string|max:200',
            'message'     => 'required|string|max:10000',
            'status'      => 'nullable|in:pending,in_progress,resolved,archived',
            'admin_notes' => 'nullable|string|max:2000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status'  => false,
                'message' => 'Validation error',
                'errors'  => $validator->errors(),
            ], 422);
        }

        $subject = $request->input('subject');
        $messageBody = $request->input('message');
        $newStatus = $request->input('status', 'resolved');

        $emailSent = false;
        try {
            \Illuminate\Support\Facades\Mail::raw($messageBody, function ($mail) use ($query, $subject) {
                $mail->to($query->email, $query->name)
                     ->subject($subject);
            });
            $emailSent = true;
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::warning('Inquiry reply email error: ' . $e->getMessage());
            $emailSent = false;
        }

        $query->status = $newStatus;
        $note = "Replied on " . now()->format('d M Y, h:i A') . " (" . ($emailSent ? "Sent via Email" : "Logged reply") . "): " . substr($subject, 0, 50);
        $query->admin_notes = $query->admin_notes ? ($query->admin_notes . "\n" . $note) : $note;
        $query->save();

        return response()->json([
            'status'     => true,
            'message'    => $emailSent ? 'Reply sent successfully to ' . $query->email : 'Reply logged and status updated.',
            'email_sent' => $emailSent,
            'data'       => $query,
        ]);
    }
}

