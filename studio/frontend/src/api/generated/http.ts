export interface paths {
    "/api/bootstrap": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Bootstrap
         * @description 只读所有 host 入口。
         */
        get: operations["bootstrap_api_bootstrap_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/workspaces": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Workspace
         * @description 登记现有目录，不创建演示配置。
         */
        post: operations["workspace_api_workspaces_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/profiles/import": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Import Profile
         * @description 导入已有 YAML 与其显式引用文档。
         */
        post: operations["import_profile_api_profiles_import_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/profiles/{profile_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Profile
         * @description 读取配置入口。
         */
        get: operations["profile_api_profiles__profile_id__get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/profiles/{profile_id}/draft": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Draft
         * @description 读取同源草稿。
         */
        get: operations["draft_api_profiles__profile_id__draft_get"];
        /**
         * Edit Draft
         * @description 一次替换请求中的草稿文本。
         */
        put: operations["edit_draft_api_profiles__profile_id__draft_put"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/profiles/{profile_id}/documents/import": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Import Document
         * @description 增加用户明确选择的引用文件。
         */
        post: operations["import_document_api_profiles__profile_id__documents_import_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/profiles/{profile_id}/validate": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Validate
         * @description 返回声明诊断，不装配 provider/MCP。
         */
        post: operations["validate_api_profiles__profile_id__validate_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/profiles/{profile_id}/save": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Save
         * @description 一次比较文件基线后原子替换，部分失败如实报告。
         */
        post: operations["save_api_profiles__profile_id__save_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/profiles/{profile_id}/apply": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Apply
         * @description 接纳后台装配，结果从 operation 读取。
         */
        post: operations["apply_api_profiles__profile_id__apply_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/generations/{generation_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Generation
         * @description 读取进程内实例的真实状态。
         */
        get: operations["generation_api_generations__generation_id__get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/generations/{generation_id}/configuration": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Configuration
         * @description 读取构造时真实采用快照。
         */
        get: operations["configuration_api_generations__generation_id__configuration_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/generations/{generation_id}/retire": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Retire
         * @description 显式退役；不自动取消正在运行的任务。
         */
        post: operations["retire_api_generations__generation_id__retire_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/operations/{operation_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Operation
         * @description 返回本进程持有的操作观察。
         */
        get: operations["operation_api_operations__operation_id__get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/workspaces/{workspace_id}/sessions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Workspace Sessions
         * @description 按 workspace 的 profile/store 关联独立分页。
         */
        get: operations["workspace_sessions_api_workspaces__workspace_id__sessions_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/stores/{store_binding_id}/sessions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Sessions
         * @description 直接传递分页到 store 唯一 owner。
         */
        get: operations["sessions_api_stores__store_binding_id__sessions_get"];
        put?: never;
        /**
         * Create Session
         * @description 预留会话，第一次 submit 才创建持久 Run。
         */
        post: operations["create_session_api_stores__store_binding_id__sessions_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/stores/{store_binding_id}/sessions/{session_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Session
         * @description 读取会话身份。
         */
        get: operations["session_api_stores__store_binding_id__sessions__session_id__get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /**
         * Title
         * @description 只修改主机标题。
         */
        patch: operations["title_api_stores__store_binding_id__sessions__session_id__patch"];
        trace?: never;
    };
    "/api/stores/{store_binding_id}/sessions/{session_id}/bootstrap": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Bootstrap
         * @description 有界历史快照；各读取有自己的水位。
         */
        get: operations["bootstrap_api_stores__store_binding_id__sessions__session_id__bootstrap_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/stores/{store_binding_id}/sessions/{session_id}/control": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Control
         * @description 不为纯 GET 创建 manager。
         */
        get: operations["control_api_stores__store_binding_id__sessions__session_id__control_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/stores/{store_binding_id}/sessions/{session_id}/lane": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Lane
         * @description 读取非终态运行 lane。
         */
        get: operations["lane_api_stores__store_binding_id__sessions__session_id__lane_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/stores/{store_binding_id}/sessions/{session_id}/messages": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Messages
         * @description 有界读取持久消息。
         */
        get: operations["messages_api_stores__store_binding_id__sessions__session_id__messages_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/stores/{store_binding_id}/sessions/{session_id}/runs": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Runs
         * @description 列出全部 phase，沿 SDK RunCursor。
         */
        get: operations["runs_api_stores__store_binding_id__sessions__session_id__runs_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/stores/{store_binding_id}/runs/{run_id}/snapshot": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Run
         * @description 完整运行投影。
         */
        get: operations["run_api_stores__store_binding_id__runs__run_id__snapshot_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/stores/{store_binding_id}/runs/{run_id}/events": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Events
         * @description 按自己已消费到的 durable sequence 补读。
         */
        get: operations["events_api_stores__store_binding_id__runs__run_id__events_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/stores/{store_binding_id}/runs/{run_id}/children": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Children
         * @description 读取直接 child，后代继续按真实 parent 查询。
         */
        get: operations["children_api_stores__store_binding_id__runs__run_id__children_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/stores/{store_binding_id}/sessions/{session_id}/inputs": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Inputs
         * @description 输入和退役共用准入锁，manager 决定投递语义。
         */
        post: operations["inputs_api_stores__store_binding_id__sessions__session_id__inputs_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/stores/{store_binding_id}/sessions/{session_id}/interactions/{interaction_id}/response": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Respond
         * @description 既有 HITL 在退役期间仍可收口。
         */
        post: operations["respond_api_stores__store_binding_id__sessions__session_id__interactions__interaction_id__response_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/stores/{store_binding_id}/sessions/{session_id}/interrupt": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Interrupt
         * @description 取消请求不冒充终态。
         */
        post: operations["interrupt_api_stores__store_binding_id__sessions__session_id__interrupt_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/stores/{store_binding_id}/sessions/{session_id}/attach": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Attach
         * @description 只绑定无 lane 历史，绝不偷调 restore。
         */
        post: operations["attach_api_stores__store_binding_id__sessions__session_id__attach_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/stores/{store_binding_id}/sessions/{session_id}/restore": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Restore
         * @description 先校验 exact run/session，再由现有 SDK 裁决恢复。
         */
        post: operations["restore_api_stores__store_binding_id__sessions__session_id__restore_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/stores/{store_binding_id}/sessions/{session_id}/fork-points": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Fork Points
         * @description 由历史领域筛选真实可分支点。
         */
        get: operations["fork_points_api_stores__store_binding_id__sessions__session_id__fork_points_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/stores/{store_binding_id}/runs/{run_id}/history": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * History
         * @description 分支点的历史消息前缀。
         */
        get: operations["history_api_stores__store_binding_id__runs__run_id__history_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/stores/{store_binding_id}/runs/{run_id}/fork": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Fork
         * @description 只复制已提交历史，不回放任何工具。
         */
        post: operations["fork_api_stores__store_binding_id__runs__run_id__fork_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/stores/{store_binding_id}/sessions/{session_id}/stream": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Session Stream
         * @description 根 session_tree 订阅保留真实 child identity。
         */
        get: operations["session_stream_api_stores__store_binding_id__sessions__session_id__stream_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/resources/{resource_id}/stream": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Resource Stream
         * @description 维护 scope 与聊天 scope 分离。
         */
        get: operations["resource_stream_api_resources__resource_id__stream_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/stores/{store_binding_id}/sessions/{session_id}/media/images": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Upload Image
         * @description 导入图片副本，尚不创建 Run 或发送消息。
         */
        post: operations["upload_image_api_stores__store_binding_id__sessions__session_id__media_images_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/stores/{store_binding_id}/sessions/{session_id}/media/{media_id}/{variant}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Read Image
         * @description 读取已登记图片的原图或模型副本。
         */
        get: operations["read_image_api_stores__store_binding_id__sessions__session_id__media__media_id___variant__get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/stores/{store_binding_id}/runs/{run_id}/tools/{tool_call_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Read Tool
         * @description 读取工具调用及其完整结果。
         */
        get: operations["read_tool_api_stores__store_binding_id__runs__run_id__tools__tool_call_id__get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/stores/{store_binding_id}/runs/{run_id}/tools/{tool_call_id}/artifact": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Read Artifact
         * @description 只读取这次工具已发布的副本。
         */
        get: operations["read_artifact_api_stores__store_binding_id__runs__run_id__tools__tool_call_id__artifact_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/stores/{store_binding_id}/runs/{run_id}/tools/{tool_call_id}/text": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Read Tool Text
         * @description 按字符窗口读取 offload 正文，或工具原有的模型文字。
         */
        get: operations["read_tool_text_api_stores__store_binding_id__runs__run_id__tools__tool_call_id__text_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/stores/{store_binding_id}/runs/{run_id}/tools/{tool_call_id}/file-change": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Read File Change
         * @description 呈现已提交 edit_file 的 patch，不读取当前文件重建历史。
         */
        get: operations["read_file_change_api_stores__store_binding_id__runs__run_id__tools__tool_call_id__file_change_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/stores/{store_binding_id}/sessions/{session_id}/goal": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Goal View
         * @description 读取 Goal，不为历史构造 manager 或推进目标。
         */
        get: operations["goal_view_api_stores__store_binding_id__sessions__session_id__goal_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/stores/{store_binding_id}/sessions/{session_id}/goal/create": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Goal Create
         * @description 通过 exact manager 创建并允许推进。
         */
        post: operations["goal_create_api_stores__store_binding_id__sessions__session_id__goal_create_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/stores/{store_binding_id}/sessions/{session_id}/goal/edit": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Goal Edit
         * @description 编辑保留原 SDK 的暂停语义。
         */
        post: operations["goal_edit_api_stores__store_binding_id__sessions__session_id__goal_edit_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/stores/{store_binding_id}/sessions/{session_id}/goal/pause": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Goal Pause
         * @description 暂停后续目标运行，不取消当前 Run。
         */
        post: operations["goal_pause_api_stores__store_binding_id__sessions__session_id__goal_pause_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/stores/{store_binding_id}/sessions/{session_id}/goal/complete": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Goal Complete
         * @description 显式完成目标。
         */
        post: operations["goal_complete_api_stores__store_binding_id__sessions__session_id__goal_complete_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/stores/{store_binding_id}/sessions/{session_id}/goal/resume": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Goal Resume
         * @description 恢复仅当前 owner 的目标，并传递 activation fence。
         */
        post: operations["goal_resume_api_stores__store_binding_id__sessions__session_id__goal_resume_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/stores/{store_binding_id}/sessions/{session_id}/goal/clear": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Goal Clear
         * @description 撤销目标选择，历史由 core 保留。
         */
        post: operations["goal_clear_api_stores__store_binding_id__sessions__session_id__goal_clear_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/stores/{store_binding_id}/sessions/{session_id}/todo": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Todo View
         * @description 读取当前 Markdown 唯一正文和原解析错误。
         */
        get: operations["todo_view_api_stores__store_binding_id__sessions__session_id__todo_get"];
        /**
         * Todo Edit
         * @description 编辑已登记 workspace 的当前文件，保存后由原 SDK 解析。
         */
        put: operations["todo_edit_api_stores__store_binding_id__sessions__session_id__todo_put"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/stores/{store_binding_id}/sessions/{session_id}/todo/document": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Todo Document
         * @description 读取可编辑原文，不把格式错误变为空清单。
         */
        get: operations["todo_document_api_stores__store_binding_id__sessions__session_id__todo_document_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/generations/{generation_id}/resources": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Generation Resources
         * @description 只返回已采用 generation 的实际资源。
         */
        get: operations["generation_resources_api_generations__generation_id__resources_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/resources/{resource_id}/maintenance": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Maintenance View
         * @description 直接选择 coordinator snapshot，不推算调度或倒计时。
         */
        get: operations["maintenance_view_api_resources__resource_id__maintenance_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/resources/{resource_id}/maintenance/memory-cycle": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Request Memory Cycle
         * @description 请求原协调器维护，HTTP 等待不拥有共享 worker。
         */
        post: operations["request_memory_cycle_api_resources__resource_id__maintenance_memory_cycle_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/resources/{resource_id}/maintenance/experience": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Request Experience
         * @description 请求原协调器生成项目经验。
         */
        post: operations["request_experience_api_resources__resource_id__maintenance_experience_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/resources/{resource_id}/maintenance/revision": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Request Revision
         * @description 由领域 owner 保存修订请求并等待其自身结算。
         */
        post: operations["request_revision_api_resources__resource_id__maintenance_revision_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/resources/{resource_id}/memory/generation": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Memory Generation
         * @description 读取实际生成积压。
         */
        get: operations["memory_generation_api_resources__resource_id__memory_generation_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/resources/{resource_id}/memory/items": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Memory Items
         * @description 读取 namespace 活跃条目，不将其归给当前 Run。
         */
        get: operations["memory_items_api_resources__resource_id__memory_items_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/resources/{resource_id}/memory/items/{item_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Memory Item
         * @description 读取 exact namespace 的单条记忆。
         */
        get: operations["memory_item_api_resources__resource_id__memory_items__item_id__get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/resources/{resource_id}/memory/events": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Memory Events
         * @description 读取原记忆事件。
         */
        get: operations["memory_events_api_resources__resource_id__memory_events_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/resources/{resource_id}/memory/overviews": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Memory Overviews
         * @description 读取实际概览投影及版本提示。
         */
        get: operations["memory_overviews_api_resources__resource_id__memory_overviews_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/resources/{resource_id}/memory/episodes": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Memory Episodes
         * @description 分页包括已经消费的经历。
         */
        get: operations["memory_episodes_api_resources__resource_id__memory_episodes_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/resources/{resource_id}/memory/episodes/{episode_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Memory Episode
         * @description 通过公开 store 和服务线程策略读取经历原文。
         */
        get: operations["memory_episode_api_resources__resource_id__memory_episodes__episode_id__get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/resources/{resource_id}/memory/observations": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Memory Observations
         * @description 读取原观察及当前处理状态。
         */
        get: operations["memory_observations_api_resources__resource_id__memory_observations_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/resources/{resource_id}/memory/observations/{observation_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Memory Observation
         * @description 读取单条观察，不由 Item 反推历史。
         */
        get: operations["memory_observation_api_resources__resource_id__memory_observations__observation_id__get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/resources/{resource_id}/memory/generation-results": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Memory Generation Results
         * @description 读取完整阶段历史，包含失败和空结果。
         */
        get: operations["memory_generation_results_api_resources__resource_id__memory_generation_results_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/resources/{resource_id}/memory/publications": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Memory Publications
         * @description 分页读取原发布 owner 保存的文件版本。
         */
        get: operations["memory_publications_api_resources__resource_id__memory_publications_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/resources/{resource_id}/memory/publications/{publication_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Memory Publication
         * @description 只显示当时发布的文档。
         */
        get: operations["memory_publication_api_resources__resource_id__memory_publications__publication_id__get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/resources/{resource_id}/evolution/sources": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Evolution Sources
         * @description 读取待处理来源短投影。
         */
        get: operations["evolution_sources_api_resources__resource_id__evolution_sources_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/resources/{resource_id}/evolution/skill": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Evolution Skill
         * @description 读取当前项目经验；不冒充历史发布正文。
         */
        get: operations["evolution_skill_api_resources__resource_id__evolution_skill_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/resources/{resource_id}/evolution/requests": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Evolution Requests
         * @description 请求列表只取摘要。
         */
        get: operations["evolution_requests_api_resources__resource_id__evolution_requests_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/resources/{resource_id}/evolution/requests/{revision_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Evolution Request
         * @description 读取原请求及不可变 evidence。
         */
        get: operations["evolution_request_api_resources__resource_id__evolution_requests__revision_id__get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/resources/{resource_id}/evolution/revisions/{revision_id}/result": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Evolution Result
         * @description pending 请求没有最终结果，不合成空成功。
         */
        get: operations["evolution_result_api_resources__resource_id__evolution_revisions__revision_id__result_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/resources/{resource_id}/evolution/publications": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Evolution Publications
         * @description 按 SDK 摘要分页，不提前抓取详情。
         */
        get: operations["evolution_publications_api_resources__resource_id__evolution_publications_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/resources/{resource_id}/evolution/publications/{publication_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Evolution Publication
         * @description expired 仍是存在的记录，保留 summary 与必要 evidence。
         */
        get: operations["evolution_publication_api_resources__resource_id__evolution_publications__publication_id__get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/stores/{store_binding_id}/runs/{run_id}/preparations": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Preparations
         * @description 只查询已保存的真实上下文事实。
         */
        get: operations["preparations_api_stores__store_binding_id__runs__run_id__preparations_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/stores/{store_binding_id}/preparations/{preparation_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Preparation
         * @description 缺失明确显示未采集，不从历史重建。
         */
        get: operations["preparation_api_stores__store_binding_id__preparations__preparation_id__get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/stores/{store_binding_id}/runs/{run_id}/configuration-adoptions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Configuration Adoptions
         * @description 返回完整配置采用事实。
         */
        get: operations["configuration_adoptions_api_stores__store_binding_id__runs__run_id__configuration_adoptions_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/configuration-snapshots/{configuration_snapshot_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Configuration Snapshot
         * @description 读取当时快照。
         */
        get: operations["configuration_snapshot_api_configuration_snapshots__configuration_snapshot_id__get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/stores/{store_binding_id}/runs/{run_id}/source-adoptions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Source Adoptions
         * @description 只展示真实采用的来源。
         */
        get: operations["source_adoptions_api_stores__store_binding_id__runs__run_id__source_adoptions_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/stores/{store_binding_id}/runs/{run_id}/model-streams": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Model Streams
         * @description 提供原 Runtime 事件的模型关联。
         */
        get: operations["model_streams_api_stores__store_binding_id__runs__run_id__model_streams_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/evidence/model-calls": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Model Calls
         * @description 按 exact Run 或资源周期读取摘要，不查询所有模型正文。
         */
        get: operations["model_calls_api_evidence_model_calls_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/evidence/model-calls/{record_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Model Call
         * @description 按全局 trace/span 身份读取；不推断未报告用量。
         */
        get: operations["model_call_api_evidence_model_calls__record_id__get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/resources/{resource_id}/source-adoptions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Resource Adoptions
         * @description 资源来源不扩散到某个当前 Run。
         */
        get: operations["resource_adoptions_api_resources__resource_id__source_adoptions_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/evidence/status": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Evidence Status
         * @description 记录器同步提交，因此无后台 pending writes。
         */
        get: operations["evidence_status_api_evidence_status_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/showcases/export": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Request Export
         * @description 启动宿主持有的选定记录导出。
         */
        post: operations["request_export_api_showcases_export_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/showcases/import": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Request Import
         * @description 读取本地记录包，不触发执行。
         */
        post: operations["request_import_api_showcases_import_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/showcases": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List Showcases
         * @description 按宿主记录顺序浏览只读展示包。
         */
        get: operations["list_showcases_api_showcases_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/showcases/{showcase_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Showcase
         * @description 读取只读包入口。
         */
        get: operations["showcase_api_showcases__showcase_id__get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/showcases/{showcase_id}/manifest": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Manifest
         * @description 读取实际捕获范围与缺失说明。
         */
        get: operations["manifest_api_showcases__showcase_id__manifest_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/showcases/{showcase_id}/record": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Record
         * @description 读取冻结标准记录；不查询运行中的主库。
         */
        get: operations["record_api_showcases__showcase_id__record_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/showcases/{showcase_id}/download": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Download
         * @description 下载解压后可直接打开的 ZIP。
         */
        get: operations["download_api_showcases__showcase_id__download_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/showcases/{showcase_id}/assets/{asset_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Asset
         * @description 仅提供当前包声明的资源。
         */
        get: operations["asset_api_showcases__showcase_id__assets__asset_id__get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/showcases/{showcase_id}/view": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * View
         * @description 在线使用与离线包相同的只读页面。
         */
        get: operations["view_api_showcases__showcase_id__view_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/showcases/{showcase_id}/viewer.js": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Viewer Script
         * @description 无执行客户端的经典脚本。
         */
        get: operations["viewer_script_api_showcases__showcase_id__viewer_js_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/showcases/{showcase_id}/viewer.css": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Viewer Style
         * @description 在线与离线共用展示样式。
         */
        get: operations["viewer_style_api_showcases__showcase_id__viewer_css_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
}
export type webhooks = Record<string, never>;
export interface components {
    schemas: {
        /**
         * AgentConfig
         * @description Agent YAML 的稳定 Python 配置模型。
         *
         *     Attributes:
         *         name (str): Agent 名称。
         *         model (ModelConfig): 模型配置。
         *         system (str | None): 简单模式的 system prompt。
         *         context (AgentContextConfig | None): 结构化 context 配置声明。
         *         skills (AgentSkillsConfig | None): 可选的项目级 Skill 发现配置。
         *         mcp (AgentMCPConfig | None): 可选的外部 MCP 文件引用与本地策略。
         *         decision (AgentDecisionConfig | None): 可选的独立判断服务及接点配置引用。
         *         compaction (CompactionConfig): 自动上下文压缩的预算与摘要指令配置。
         *         context_policy (ContextPolicyConfig): 当前会话上下文回读策略。
         *         memory (MemoryConfig): 长期记忆开关、概览预算与读写 namespace。
         *         prompts (PromptConfig): 相对 root workspace 的项目命名模板目录。
         *         maintenance (MaintenanceConfig): 宿主共享维护的空闲等待。
         *         evolution (EvolutionConfig): 默认关闭的项目经验自动维护。
         *         goal (GoalConfig): 可选跨 Run 目标能力与默认自动轮数。
         *         todo (TodoConfig): 会话 Markdown 待办清单开关。
         *         observability (AgentObservabilityConfig): 默认关闭的运行观测与正文采集策略。
         *         speech (SpeechConfig): 默认关闭的语音输入声明，由宿主装配客户端。
         *         tools (ToolsConfig): 工具配置。
         *         hooks (tuple[HookConfig, ...]): 按声明顺序执行的四事件处理器。
         *         middleware (MiddlewareConfig): 普通工具调用的包装链配置。
         *         permissions (PermissionsConfig): 权限配置。
         *         command (CommandConfig): root 命令环境配置，不自动注册工具。
         *         session (SessionConfig): 会话配置。
         */
        AgentConfig: {
            /** Name */
            name: string;
            model: components["schemas"]["ModelConfig"];
            /** System */
            system?: string | null;
            context?: components["schemas"]["AgentContextConfig"] | null;
            skills?: components["schemas"]["AgentSkillsConfig"] | null;
            mcp?: components["schemas"]["AgentMCPConfig"] | null;
            decision?: components["schemas"]["AgentDecisionConfig"] | null;
            compaction?: components["schemas"]["CompactionConfig"];
            context_policy?: components["schemas"]["ContextPolicyConfig"];
            memory?: components["schemas"]["MemoryConfig"];
            prompts?: components["schemas"]["PromptConfig"];
            maintenance?: components["schemas"]["MaintenanceConfig"];
            evolution?: components["schemas"]["EvolutionConfig"];
            goal?: components["schemas"]["GoalConfig"];
            todo?: components["schemas"]["TodoConfig"];
            observability?: components["schemas"]["AgentObservabilityConfig"];
            speech?: components["schemas"]["SpeechConfig"];
            tools?: components["schemas"]["ToolsConfig"];
            /**
             * Hooks
             * @default []
             */
            hooks: components["schemas"]["HookConfig"][];
            middleware?: components["schemas"]["MiddlewareConfig"];
            permissions?: components["schemas"]["PermissionsConfig"];
            command?: components["schemas"]["CommandConfig"];
            session?: components["schemas"]["SessionConfig"];
        };
        /**
         * AgentContextConfig
         * @description Agent 引用的 context 配置声明。
         *
         *     Attributes:
         *         path (Path): 独立 `context.yaml` 文件路径。
         */
        AgentContextConfig: {
            /**
             * Path
             * Format: path
             */
            path: string;
        };
        /**
         * AgentDecisionConfig
         * @description 按声明它的 Agent YAML 解析相对路径，不在模型内读取文件。
         */
        AgentDecisionConfig: {
            /**
             * Path
             * Format: path
             */
            path: string;
        };
        /**
         * AgentMCPConfig
         * @description 引用单个 MCP 文件；读取和环境求值由后续装配与准备负责。
         */
        AgentMCPConfig: {
            /**
             * Path
             * Format: path
             */
            path: string;
            /** Overrides */
            overrides?: {
                [key: string]: components["schemas"]["MCPServerOverride"];
            };
        };
        /**
         * AgentObservabilityConfig
         * @description 构建期确定的 Agent 采集策略。
         */
        AgentObservabilityConfig: {
            /**
             * Enabled
             * @default false
             */
            enabled: boolean;
            /**
             * Capture Content
             * @default false
             */
            capture_content: boolean;
            /**
             * Max Content Chars
             * @default 65536
             */
            max_content_chars: number;
        };
        /**
         * AgentRunOptions
         * @description Logical run 的完整固定选项。
         */
        AgentRunOptions: {
            limits?: components["schemas"]["RunLimits"];
            runtime?: components["schemas"]["RuntimeExecutionOptions"];
        };
        /**
         * AgentSkillsConfig
         * @description Agent 的 Skill 发现配置。
         */
        AgentSkillsConfig: {
            /**
             * Enabled
             * @default false
             */
            enabled: boolean;
            /**
             * Root
             * @default .agents/skills
             */
            root: string;
            /**
             * Require
             * @default []
             */
            require: string[];
        };
        /**
         * ApiError
         * @description HTTP 错误正文。
         */
        ApiError: {
            /** Code */
            code: string;
            /** Message */
            message: string;
            /** Request Id */
            request_id?: string | null;
            /** Field Errors */
            field_errors?: components["schemas"]["FieldError"][];
            /** Details */
            details?: {
                [key: string]: unknown;
            };
        };
        /**
         * ApplyInput
         * @description 请求起点版本与实际采用版本分开。
         */
        ApplyInput: {
            /** Request Id */
            request_id?: string | null;
            /** Config Revision Id */
            config_revision_id: string;
        };
        /**
         * ArtifactView
         * @description 发布副本的读取地址，不将任意路径变成文件服务。
         */
        ArtifactView: {
            /** Mime Type */
            mime_type: string;
            /** Size Bytes */
            size_bytes: number;
            /** Preview */
            preview: string;
            /** Download Url */
            download_url: string;
            /** Preview Url */
            preview_url: string | null;
            /** Text Url */
            text_url: string | null;
        };
        /**
         * AttachInput
         * @description 选择继续历史使用的实例。
         */
        AttachInput: {
            /** Request Id */
            request_id?: string | null;
            /** Generation Id */
            generation_id: string;
        };
        /**
         * AttachResult
         * @description 绑定后可继续输入，不触发模型。
         */
        AttachResult: {
            /** Request Id */
            request_id: string;
            session: components["schemas"]["SessionView"];
            generation: components["schemas"]["GenerationView"];
            control: components["schemas"]["SessionControlSnapshot"];
        };
        /** Body_request_import_api_showcases_import_post */
        Body_request_import_api_showcases_import_post: {
            /** Bundle */
            bundle: string;
        };
        /** Body_upload_image_api_stores__store_binding_id__sessions__session_id__media_images_post */
        Body_upload_image_api_stores__store_binding_id__sessions__session_id__media_images_post: {
            /** File */
            file: string;
            /** Name */
            name?: string | null;
        };
        /**
         * Bootstrap
         * @description 空启动也是完整合法工作台。
         */
        Bootstrap: {
            /** Backend Epoch */
            backend_epoch: string;
            /** Workspaces */
            workspaces: components["schemas"]["WorkspaceView"][];
            /** Profiles */
            profiles: components["schemas"]["ProfileView"][];
            /** Generations */
            generations: components["schemas"]["GenerationView"][];
            /** Storage Bindings */
            storage_bindings: components["schemas"]["StorageBindingView"][];
            /** Default Profile Id */
            default_profile_id?: string | null;
        };
        /**
         * ChildRunSummary
         * @description 持久父工具关系、真实 selector 与 child 自身的运行快照。
         */
        ChildRunSummary: {
            run: components["schemas"]["RunSnapshot"];
            /** Parent Run Id */
            parent_run_id: string;
            /** Parent Tool Call Id */
            parent_tool_call_id: string;
            /** Agent Selector */
            agent_selector: string;
        };
        /**
         * CommandConfig
         * @description root 命令模式与默认期限，child 借用已选定的配置。
         */
        CommandConfig: {
            /** @default native */
            mode: components["schemas"]["CommandMode"];
            /**
             * Timeout Seconds
             * @default 120
             */
            timeout_seconds: number;
            docker?: components["schemas"]["DockerConfig"] | null;
        };
        /**
         * CommandHookHandlerConfig
         * @description 在当前 Agent 命令环境中执行的固定脚本声明。
         */
        CommandHookHandlerConfig: {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            type: "command";
            command: components["schemas"]["_NonemptyText"];
        };
        /**
         * CommandMode
         * @description 由 root 实例选定的命令运行环境。
         * @enum {string}
         */
        CommandMode: "native" | "docker";
        /**
         * CompactionConfig
         * @description 压缩配置；输入预算已扣除模型输出预留。
         *
         *     Attributes:
         *         input_budget_tokens (int): 完整模型请求的可用输入预算。
         *         keep_recent_ratio (float): 近期原文相对输入预算的保留目标比例。
         *         summary_ratio (float): 摘要生成上限相对输入预算的比例。
         *         timeout_seconds (float): 一次完整压缩操作的超时秒数。
         */
        CompactionConfig: {
            /**
             * Input Budget Tokens
             * @default 96000
             */
            input_budget_tokens: number;
            /**
             * Keep Recent Ratio
             * @default 0.15
             */
            keep_recent_ratio: number;
            /**
             * Summary Ratio
             * @default 0.05
             */
            summary_ratio: number;
            /**
             * Timeout Seconds
             * @default 300
             */
            timeout_seconds: number;
        };
        /**
         * ConfigDiagnostic
         * @description 文件语法与领域解析诊断。
         */
        ConfigDiagnostic: {
            /** Document Id */
            document_id: string;
            /** Path */
            path?: string | null;
            /** Message */
            message: string;
            /**
             * Severity
             * @enum {string}
             */
            severity: "error" | "warning";
        };
        /**
         * ConfigDocument
         * @description 保留原文的单文件草稿。
         */
        ConfigDocument: {
            /** Document Id */
            document_id: string;
            /**
             * Kind
             * @enum {string}
             */
            kind: "agent" | "context" | "mcp" | "decision" | "subagent_catalog" | "prompt" | "skill";
            /** Original Path */
            original_path: string;
            /** Base Text */
            base_text: string;
            /** Draft Text */
            draft_text: string;
            /** Draft Revision */
            draft_revision: number;
        };
        /**
         * ConfigDraft
         * @description Profile 的同源文档草稿。
         */
        ConfigDraft: {
            /** Profile Id */
            profile_id: string;
            /** Draft Revision */
            draft_revision: number;
            /** Documents */
            documents: components["schemas"]["ConfigDocument"][];
        };
        /**
         * ConfigValidation
         * @description 仅声明解析的验证结果。
         */
        ConfigValidation: {
            /** Valid */
            valid: boolean;
            /** Checked Scope */
            checked_scope: string[];
            /** Diagnostics */
            diagnostics: components["schemas"]["ConfigDiagnostic"][];
            effective_agent_config: components["schemas"]["AgentConfig"] | null;
        };
        /**
         * ConfigurationApplied
         * @description 本次真实 activation 采用的完整 Runner 配置，可直接类型化序列化。
         */
        ConfigurationApplied: {
            /** Configuration Snapshot Id */
            configuration_snapshot_id: string;
            /** Run Id */
            run_id: string;
            /** Session Id */
            session_id: string;
            /** Activation Id */
            activation_id: string;
            /** Agent Id */
            agent_id: string;
            configuration: components["schemas"]["EffectiveConfiguration"];
        };
        /**
         * ConfigurationDependency
         * @description 实际依赖类型及装配来源；不序列化凭据或 Python 对象内部状态。
         */
        ConfigurationDependency: {
            /** Kind */
            kind: string;
            /** Type Name */
            type_name: string;
            /**
             * Origin
             * @enum {string}
             */
            origin: "configured" | "injected";
        };
        /**
         * ContextDecision
         * @description 真实选择分支对一个来源作出的决定。
         */
        ContextDecision: {
            /** Subject Kind */
            subject_kind: string;
            /** Subject Ref */
            subject_ref: string;
            /**
             * Action
             * @enum {string}
             */
            action: "retained" | "replaced" | "removed" | "summarized" | "unchanged";
            /** Reason Code */
            reason_code: string;
            /** Related Ref */
            related_ref?: string | null;
        };
        /**
         * ContextPolicyConfig
         * @description 控制当前会话上下文的工具回读能力。
         */
        ContextPolicyConfig: {
            /**
             * Enabled
             * @default true
             */
            enabled: boolean;
            /**
             * Preserve Recent Tool Groups
             * @default 2
             */
            preserve_recent_tool_groups: number;
            /**
             * Old Result Preview Chars
             * @default 512
             */
            old_result_preview_chars: number;
            /**
             * Deferred Tools
             * @default false
             */
            deferred_tools: boolean;
        };
        /**
         * ContextPreparation
         * @description 一次 before_model 准备的完整只读结果。
         */
        ContextPreparation: {
            /** Preparation Id */
            preparation_id: string;
            /** Configuration Snapshot Id */
            configuration_snapshot_id: string;
            /** Session Id */
            session_id: string;
            /** Run Id */
            run_id: string;
            /** Activation Id */
            activation_id: string;
            /** Step Index */
            step_index: number;
            /**
             * Phase
             * @enum {string}
             */
            phase: "preparing" | "ready" | "failed" | "cancelled";
            /** Input Budget Tokens */
            input_budget_tokens: number;
            /** Trigger Tokens */
            trigger_tokens: number;
            /**
             * Stages
             * @default []
             */
            stages: components["schemas"]["ContextStage"][];
            /**
             * Selected Tool Names
             * @default []
             */
            selected_tool_names: string[];
            /**
             * Selected Contribution Keys
             * @default []
             */
            selected_contribution_keys: string[];
            /**
             * Protected Refs
             * @default []
             */
            protected_refs: string[];
            /** Final Input Tokens */
            final_input_tokens?: number | null;
            /** Final Request Ref */
            final_request_ref?: string | null;
            error?: components["schemas"]["RunErrorInfo"] | null;
        };
        /**
         * ContextPreparationSummary
         * @description 上下文列表只投影实际准备事实的短字段。
         */
        ContextPreparationSummary: {
            /** Preparation Id */
            preparation_id: string;
            /** Run Id */
            run_id: string;
            /** Activation Id */
            activation_id: string;
            /** Step Index */
            step_index: number;
            /** Phase */
            phase: string;
            /** Final Input Tokens */
            final_input_tokens?: number | null;
        };
        /**
         * ContextStage
         * @description 完整请求的阶段计量；candidate 不表示已经应用。
         */
        ContextStage: {
            /** Index */
            index: number;
            /** Kind */
            kind: string;
            /**
             * Outcome
             * @enum {string}
             */
            outcome: "applied" | "skipped" | "candidate" | "rejected";
            /** Before Input Tokens */
            before_input_tokens?: number | null;
            /** After Input Tokens */
            after_input_tokens?: number | null;
            /**
             * Decisions
             * @default []
             */
            decisions: components["schemas"]["ContextDecision"][];
            /** Compaction Ref */
            compaction_ref?: string | null;
        };
        /**
         * ControlView
         * @description 未接管历史的 control 明确为空。
         */
        ControlView: {
            control: components["schemas"]["SessionControlSnapshot"] | null;
        };
        /**
         * CreateSessionInput
         * @description 选择具体实例建立空会话。
         */
        CreateSessionInput: {
            /** Request Id */
            request_id?: string | null;
            /** Generation Id */
            generation_id: string;
            /** Title */
            title?: string | null;
        };
        /**
         * DockerConfig
         * @description 单个 root 共享的本地 Linux 容器配置。
         */
        DockerConfig: {
            /**
             * Image
             * @default iris-command:local
             */
            image: string;
            /** Endpoint */
            endpoint?: string | null;
            /**
             * Network
             * @default none
             * @enum {string}
             */
            network: "none" | "bridge";
            /**
             * Cpus
             * @default 2
             */
            cpus: number;
            /**
             * Memory Mb
             * @default 1024
             */
            memory_mb: number;
            /**
             * Pids Limit
             * @default 128
             */
            pids_limit: number;
            /** Environment */
            environment?: {
                [key: string]: string;
            };
        };
        /**
         * DocumentEdit
         * @description 同源文本更新。
         */
        DocumentEdit: {
            /** Document Id */
            document_id: string;
            /** Text */
            text: string;
        };
        /**
         * DocumentInput
         * @description 导入用户选择的真实来源文件。
         */
        DocumentInput: {
            /** Path */
            path: string;
            /**
             * Kind
             * @enum {string}
             */
            kind: "agent" | "context" | "mcp" | "decision" | "subagent_catalog" | "prompt" | "skill";
        };
        /**
         * DraftInput
         * @description 草稿 CAS revision。
         */
        DraftInput: {
            /** Base Draft Revision */
            base_draft_revision: number;
            /** Documents */
            documents: components["schemas"]["DocumentEdit"][];
        };
        /**
         * DurableRunCursor
         * @description 按 run durable sequence 读取的 cursor。
         */
        DurableRunCursor: {
            /** Run Id */
            run_id: string;
            /** After Sequence */
            after_sequence: number;
        };
        /**
         * EffectiveConfiguration
         * @description 构造期配置、冻结来源和准备后实际目录的只读描述。
         */
        EffectiveConfiguration: {
            /** Configuration Snapshot Id */
            configuration_snapshot_id: string;
            /**
             * Constructed At
             * Format: date-time
             */
            constructed_at: string;
            /** Config Path */
            config_path: string | null;
            agent_config: components["schemas"]["AgentConfig"];
            /**
             * Workspace Root
             * Format: path
             */
            workspace_root: string;
            /** Source Documents */
            source_documents: components["schemas"]["SourceDocument"][];
            /** Dependencies */
            dependencies: components["schemas"]["ConfigurationDependency"][];
            /**
             * Source Completeness
             * @enum {string}
             */
            source_completeness: "complete" | "partial" | "effective_only";
            storage: components["schemas"]["LifecycleStorageDescription"];
            /** Tool Catalog */
            tool_catalog: components["schemas"]["ToolDefinition"][];
            /** Skill Catalog */
            skill_catalog: components["schemas"]["SkillMetadata"][];
            /** Prepared */
            prepared: boolean;
        };
        /**
         * EventsPage
         * @description 精确运行事件页。
         */
        EventsPage: {
            /** Events */
            events: components["schemas"]["RunEvent"][];
            next_cursor: components["schemas"]["DurableRunCursor"] | null;
        };
        /** EvidenceItems[ConfigurationApplied] */
        EvidenceItems_ConfigurationApplied_: {
            /** Items */
            items: components["schemas"]["ConfigurationApplied"][];
        };
        /** EvidenceItems[ModelStreamLink] */
        EvidenceItems_ModelStreamLink_: {
            /** Items */
            items: components["schemas"]["ModelStreamLink"][];
        };
        /** EvidenceItems[SourceAdopted] */
        EvidenceItems_SourceAdopted_: {
            /** Items */
            items: components["schemas"]["SourceAdopted"][];
        };
        /**
         * EvidenceStatus
         * @description 证据写入状态独立于领域执行结果。
         */
        EvidenceStatus: {
            /** Recording Enabled */
            recording_enabled: boolean;
            /** Pending Writes */
            pending_writes: number;
            /** Write Error */
            write_error: string | null;
        };
        /**
         * EvolutionConfig
         * @description 项目经验与有限策略修订的开关、目标、策略和独立请求预算。
         */
        EvolutionConfig: {
            /**
             * Enabled
             * @default false
             */
            enabled: boolean;
            /** Policy Skill */
            policy_skill?: string | null;
            /**
             * Skill Max Chars
             * @default 8000
             */
            skill_max_chars: number;
            /**
             * Input Budget Tokens
             * @default 32000
             */
            input_budget_tokens: number;
            /**
             * Output Budget Tokens
             * @default 8000
             */
            output_budget_tokens: number;
            /**
             * Prompt Targets
             * @default []
             */
            prompt_targets: ("memory_flush" | "memory_dream" | "memory_overview" | "project_skill_update" | "compaction" | "compaction_input")[];
            /**
             * Config Targets
             * @default []
             */
            config_targets: ("context_policy.preserve_recent_tool_groups" | "context_policy.old_result_preview_chars" | "compaction.input_budget_tokens" | "compaction.keep_recent_ratio" | "compaction.summary_ratio" | "todo.enabled" | "system")[];
        };
        /**
         * EvolutionMaterial
         * @description 一次读取的完整消息范围，允许过滤后没有正文。
         */
        EvolutionMaterial: {
            source: components["schemas"]["EvolutionSource"];
            /** Start Message Count */
            start_message_count: number;
            /** End Message Count */
            end_message_count: number;
            /**
             * Records
             * @default []
             */
            records: components["schemas"]["EvolutionRecord"][];
        };
        /**
         * EvolutionRange
         * @description 一个来源的消息半开区间。
         */
        EvolutionRange: {
            source: components["schemas"]["EvolutionSource"];
            /** Start Message Count */
            start_message_count: number;
            /** End Message Count */
            end_message_count: number;
        };
        /**
         * EvolutionRecord
         * @description 已提交消息中的原文片段与稳定引用。
         */
        EvolutionRecord: {
            /** Ref */
            ref: string;
            /** Message Ordinal */
            message_ordinal: number;
            /** Block Index */
            block_index: number;
            /** Role */
            role: string;
            /** Text */
            text: string;
            /** Occurred At */
            occurred_at: string;
            /** Metadata */
            metadata?: {
                [key: string]: unknown;
            };
        };
        /**
         * EvolutionResult
         * @description 单次 A 或 B 的短结果，不保存模型调用轨迹。
         */
        EvolutionResult: {
            /**
             * Stage
             * @default experience
             * @enum {string}
             */
            stage: "experience" | "revision";
            status: components["schemas"]["EvolutionStatus"];
            /**
             * Reason
             * @default
             */
            reason: string;
            /**
             * Consumed Ranges
             * @default []
             */
            consumed_ranges: components["schemas"]["EvolutionRange"][];
            /** Usage */
            usage?: {
                [key: string]: number;
            };
            /**
             * Has More
             * @default false
             */
            has_more: boolean;
            /**
             * Effect
             * @default
             */
            effect: string;
            /** Revision Id */
            revision_id?: string | null;
            /** Publication Id */
            publication_id?: string | null;
            /** Error Code */
            error_code?: "publication_unconfirmed" | null;
            /**
             * Targets
             * @default []
             */
            targets: components["schemas"]["RevisionTarget"][];
        };
        /**
         * EvolutionSession
         * @description 宿主显式请求的可选会话归属，不伪造 Run。
         */
        EvolutionSession: {
            /** Lifecycle Source Id */
            lifecycle_source_id: string;
            /** Session Id */
            session_id: string;
        };
        /**
         * EvolutionSource
         * @description 真实经历的 lifecycle 身份，不复制运行资格。
         */
        EvolutionSource: {
            /** Lifecycle Source Id */
            lifecycle_source_id: string;
            /** Run Id */
            run_id: string;
            /** Session Id */
            session_id: string;
        };
        /**
         * EvolutionSources
         * @description 只展示尚待处理的来源短身份。
         */
        EvolutionSources: {
            /** Pending Sources */
            pending_sources: components["schemas"]["EvolutionSource"][];
            /** Pending Sessions */
            pending_sessions: components["schemas"]["EvolutionSession"][];
        };
        /** @enum {string} */
        EvolutionStatus: "updated" | "no_change" | "empty" | "failed" | "cancelled" | "conflict";
        /**
         * ExperienceOrigin
         * @description A 从真实材料提炼的问题来源。
         */
        ExperienceOrigin: {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            kind: "experience";
            /** Sources */
            sources: components["schemas"]["EvolutionSource"][];
        };
        /**
         * ExportAsset
         * @description 包内资源以主机生成的身份定位，不接受外部路径。
         */
        ExportAsset: {
            /** Asset Id */
            asset_id: string;
            /** Name */
            name: string;
            /** Mime Type */
            mime_type: string;
            /** Size Bytes */
            size_bytes: number;
        };
        /**
         * ExportInput
         * @description 只导出选定的真实记录。
         */
        ExportInput: {
            /** Request Id */
            request_id?: string | null;
            /** Title */
            title: string;
            /** Runs */
            runs: components["schemas"]["SelectedRun"][];
            /**
             * Include Children
             * @default true
             */
            include_children: boolean;
            /** Publications */
            publications?: components["schemas"]["SelectedPublication"][];
            /** Artifact Selection */
            artifact_selection?: components["schemas"]["SelectedArtifact"][];
        };
        /**
         * ExportedRun
         * @description 捕获水位以内的真实运行与观察资料。
         */
        ExportedRun: {
            /** Store Binding Id */
            store_binding_id: string;
            /** Source Id */
            source_id: string;
            run: components["schemas"]["RunSnapshot"];
            result: components["schemas"]["RunResult"] | null;
            /** Session Id */
            session_id: string;
            /** Messages */
            messages: components["schemas"]["UiMessage"][];
            /** Tools */
            tools: components["schemas"]["UiToolCall"][];
            /** Events */
            events: components["schemas"]["RunEvent"][];
            /** Lineage */
            lineage: {
                [key: string]: unknown;
            } | null;
            /** Message Start */
            message_start: number;
            /** Message End */
            message_end: number;
            /** Event Watermark */
            event_watermark: number;
            /** Evidence */
            evidence: {
                [key: string]: unknown;
            };
        };
        /**
         * FieldError
         * @description 输入字段错误。
         */
        FieldError: {
            /** Path */
            path: string;
            /** Message */
            message: string;
        };
        /**
         * FileChange
         * @description 某次 edit_file 的真实变化。
         */
        FileChange: {
            /** File Path */
            file_path: string;
            /** Patch */
            patch: string;
        };
        /**
         * ForkPoint
         * @description 一个 terminal 顶层 run 的请求信息与历史消息截点。
         */
        ForkPoint: {
            /** Run Id */
            run_id: string;
            /** Session Id */
            session_id: string;
            /** Agent Id */
            agent_id: string;
            /** Input */
            input: string;
            stop_reason: components["schemas"]["RunStopReason"];
            /**
             * Created At
             * Format: date-time
             */
            created_at: string;
            /**
             * Finished At
             * Format: date-time
             */
            finished_at: string;
            /** Message Count */
            message_count: number;
        };
        /**
         * GenerationResult
         * @description 一次阶段执行的实际结果、成本和错误；不混入主 run usage。
         */
        GenerationResult: {
            /** Id */
            id?: string;
            /** Namespace */
            namespace: string;
            /**
             * Stage
             * @enum {string}
             */
            stage: "capture" | "flush" | "dream" | "overview";
            /**
             * Status
             * @enum {string}
             */
            status: "completed" | "empty" | "failed" | "cancelled" | "conflict" | "blocked";
            /** Usage */
            usage?: {
                [key: string]: number;
            };
            /**
             * Elapsed Seconds
             * @default 0
             */
            elapsed_seconds: number;
            /** Error */
            error?: string | null;
            /**
             * Input Ids
             * @default []
             */
            input_ids: string[];
            /**
             * Consumed Ranges
             * @default []
             */
            consumed_ranges: components["schemas"]["MemoryConsumedRange"][];
            /** Counts */
            counts?: {
                [key: string]: number;
            };
            /** Item Revision */
            item_revision?: number | null;
            /**
             * Has More
             * @default false
             */
            has_more: boolean;
            /** Created At */
            created_at?: string;
        };
        /**
         * GenerationState
         * @description 当前 namespace 的持久积压、受阻数量和最近执行结果。
         */
        GenerationState: {
            /** Namespace */
            namespace: string;
            /** Pending Episodes */
            pending_episodes: number;
            /** Pending Observations */
            pending_observations: number;
            /** Blocked Observations */
            blocked_observations: number;
            /** Pending Changes */
            pending_changes: number;
            /** Blocked Changes */
            blocked_changes: number;
            /** Item Revision */
            item_revision: number;
            /** Projection Revision */
            projection_revision: number | null;
            /** Latest Results */
            latest_results: components["schemas"]["GenerationResult"][];
            /** Overview Revision */
            overview_revision?: number | null;
        };
        /**
         * GenerationView
         * @description 一次真实配置采用。
         */
        GenerationView: {
            /** Generation Id */
            generation_id: string;
            /** Profile Id */
            profile_id: string;
            /** Config Revision Id */
            config_revision_id: string;
            /** Requested Config Revision Id */
            requested_config_revision_id?: string | null;
            /** Store Binding Id */
            store_binding_id: string;
            /** Source Id */
            source_id: string;
            /** Configuration Snapshot Id */
            configuration_snapshot_id: string;
            /**
             * Constructed At
             * Format: date-time
             */
            constructed_at: string;
            /**
             * State
             * @enum {string}
             */
            state: "ready" | "retiring" | "retired";
            /** Resource Refs */
            resource_refs?: components["schemas"]["ResourceRef"][];
            recovery_source?: components["schemas"]["RecoverySource"] | null;
        };
        /**
         * GoalConfig
         * @description 配置目标能力是否启用及创建时的默认轮数上限。
         */
        GoalConfig: {
            /**
             * Enabled
             * @default false
             */
            enabled: boolean;
            /**
             * Max Rounds
             * @default 20
             */
            max_rounds: number;
        };
        /**
         * GoalControlResult
         * @description 宿主控制实际达到的阶段及其最新只读视图。
         */
        GoalControlResult: {
            view: components["schemas"]["GoalView"];
            /**
             * Disposition
             * @enum {string}
             */
            disposition: "scheduled" | "admitted" | "running" | "waiting" | "needs_recovery" | "occupied" | "stopped";
        };
        /**
         * GoalCreateBody
         * @description 创建目标的原始公开输入。
         */
        GoalCreateBody: {
            /** Request Id */
            request_id?: string | null;
            /** Objective */
            objective: string;
            /** Max Rounds */
            max_rounds?: number | null;
            run_options?: components["schemas"]["AgentRunOptions"] | null;
        };
        /**
         * GoalEditBody
         * @description 编辑目标，并由原控制器暂停后续推进。
         */
        GoalEditBody: {
            /** Request Id */
            request_id?: string | null;
            /** Objective */
            objective?: string | null;
            /** Max Rounds */
            max_rounds?: number | null;
            run_options?: components["schemas"]["AgentRunOptions"] | null;
        };
        /**
         * GoalReason
         * @description 供宿主解释状态变化的稳定原因码与正文。
         */
        GoalReason: {
            /** Code */
            code: string;
            /** Text */
            text: string;
        };
        /**
         * GoalReasonBody
         * @description 用户暂停或完成的原因。
         */
        GoalReasonBody: {
            /** Request Id */
            request_id?: string | null;
            /** Reason */
            reason: string;
        };
        /**
         * GoalReply
         * @description 原 Goal 控制结果及请求关联。
         */
        GoalReply: {
            /** Request Id */
            request_id: string | null;
            result: components["schemas"]["GoalControlResult"];
        };
        /**
         * GoalResumeBody
         * @description 恢复目标的原 activation fence。
         */
        GoalResumeBody: {
            /** Request Id */
            request_id?: string | null;
            /** Expected Activation Id */
            expected_activation_id?: string | null;
        };
        /**
         * GoalSnapshot
         * @description 目标权威快照；不复制 Run 状态、使用量或进程 armed 标记。
         */
        GoalSnapshot: {
            /** Goal Id */
            goal_id: string;
            /** Session Id */
            session_id: string;
            /** Revision */
            revision: number;
            /** Objective */
            objective: string;
            status: components["schemas"]["GoalStatus"];
            reason?: components["schemas"]["GoalReason"] | null;
            /** Max Rounds */
            max_rounds: number;
            /** Rounds Started */
            rounds_started: number;
            run_options: components["schemas"]["AgentRunOptions"];
            /**
             * Created At
             * Format: date-time
             */
            created_at: string;
            /**
             * Updated At
             * Format: date-time
             */
            updated_at: string;
        };
        /**
         * GoalStatus
         * @description 目标的四种持久业务状态。
         * @enum {string}
         */
        GoalStatus: "active" | "paused" | "blocked" | "completed";
        /**
         * GoalView
         * @description 持久事实与进程状态的统一只读投影。
         */
        GoalView: {
            goal: components["schemas"]["GoalSnapshot"] | null;
            /** Armed */
            armed: boolean;
            run: components["schemas"]["RunSnapshot"] | null;
            /** Run Goal Id */
            run_goal_id: string | null;
            interaction: components["schemas"]["HumanInteraction"] | null;
            /** Settlement Pending */
            settlement_pending: boolean;
            driver_error: components["schemas"]["RunErrorInfo"] | null;
        };
        /** HTTPValidationError */
        HTTPValidationError: {
            /** Detail */
            detail?: components["schemas"]["ValidationError"][];
        };
        /**
         * HookConfig
         * @description 有序事件处理器；tools 使用实际工具调用名而非 builtin 配置键。
         */
        HookConfig: {
            name: components["schemas"]["_NonemptyText"];
            event: components["schemas"]["HookEventName"];
            handler: components["schemas"]["HookHandlerConfig"];
            /** Tools */
            tools?: components["schemas"]["_NonemptyText"][] | null;
            /**
             * Timeout Seconds
             * @default 10
             */
            timeout_seconds: number;
        };
        /** @enum {string} */
        HookEventName: "run.started" | "run.finished" | "tool.before" | "tool.after";
        HookHandlerConfig: components["schemas"]["PythonHookHandlerConfig"] | components["schemas"]["CommandHookHandlerConfig"];
        /**
         * HostOrigin
         * @description 宿主明确请求，可无历史失败或 Run 归属。
         */
        HostOrigin: {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            kind: "host";
            session?: components["schemas"]["EvolutionSession"] | null;
        };
        /**
         * HumanInteraction
         * @description 持久化的一次人工 gate 与 response/close 状态。
         */
        HumanInteraction: {
            /** Interaction Id */
            interaction_id?: string;
            /** Session Id */
            session_id: string;
            /** Run Id */
            run_id: string;
            /** Step Index */
            step_index: number;
            /** Tool Call Id */
            tool_call_id: string;
            /** @default pending */
            status: components["schemas"]["InteractionStatus"];
            request: components["schemas"]["HumanInteractionRequest"];
            /** Response */
            response?: (components["schemas"]["PermissionInteractionResponse"] | components["schemas"]["QuestionInteractionResponse"]) | null;
            /**
             * Version
             * @default 1
             */
            version: number;
            /**
             * Created At
             * Format: date-time
             */
            created_at?: string;
            /** Expires At */
            expires_at?: string | null;
            /** Resolved At */
            resolved_at?: string | null;
            /** Closed At */
            closed_at?: string | null;
            /** Close Reason */
            close_reason?: string | null;
        };
        /**
         * HumanInteractionRequest
         * @description 所有人工 gate 共用的工具调用与提示信封。
         */
        HumanInteractionRequest: {
            tool_call: components["schemas"]["ToolCallSnapshot"];
            /** Prompt */
            prompt: components["schemas"]["PermissionPrompt"] | components["schemas"]["QuestionPrompt"];
            subagent_origin?: components["schemas"]["SubagentProxyOrigin"] | null;
        };
        /**
         * ImageBlock
         * @description 图片的原始副本与模型副本引用，不携带请求编码。
         */
        ImageBlock: {
            /**
             * Type
             * @default image
             * @constant
             */
            type: "image";
            original: components["schemas"]["ImageFileRef"];
            model: components["schemas"]["ImageFileRef"];
            /** Name */
            name?: string | null;
        };
        /**
         * ImageFileRef
         * @description 已保存图片的绝对路径、实际编码格式和像素尺寸。
         */
        ImageFileRef: {
            /**
             * Path
             * Format: path
             */
            path: string;
            /** Mime Type */
            mime_type: string;
            /** Width */
            width: number;
            /** Height */
            height: number;
        };
        /**
         * ImageInput
         * @description 输入只引用本会话已登记的图片。
         */
        ImageInput: {
            /**
             * Type
             * @default image
             * @constant
             */
            type: "image";
            /** Media Id */
            media_id: string;
        };
        /**
         * InteractionInput
         * @description 当前 Iris typed HITL response。
         */
        InteractionInput: {
            /** Request Id */
            request_id?: string | null;
            /** Response */
            response: components["schemas"]["PermissionInteractionResponse"] | components["schemas"]["QuestionInteractionResponse"];
        };
        /**
         * InteractionStatus
         * @description 人工响应的生命周期状态。
         * @enum {string}
         */
        InteractionStatus: "pending" | "resolved" | "closed";
        /**
         * InterruptAccepted
         * @description 取消请求已被处理。
         */
        InterruptAccepted: {
            /** Request Id */
            request_id: string;
            receipt: components["schemas"]["InterruptReceipt"];
        };
        /**
         * InterruptInput
         * @description 显式请求取消或停止自动目标推进。
         */
        InterruptInput: {
            /** Request Id */
            request_id?: string | null;
            /** Reason */
            reason?: string | null;
        };
        /**
         * InterruptReceipt
         * @description 取消后真实快照。
         */
        InterruptReceipt: {
            run: components["schemas"]["RunSnapshot"] | null;
        };
        /** Items[MemoryEvent] */
        Items_MemoryEvent_: {
            /** Items */
            items: components["schemas"]["MemoryEvent"][];
        };
        /** Items[MemoryItem] */
        Items_MemoryItem_: {
            /** Items */
            items: components["schemas"]["MemoryItem"][];
        };
        /** Items[MemoryOverviewDocument] */
        Items_MemoryOverviewDocument_: {
            /** Items */
            items: components["schemas"]["MemoryOverviewDocument"][];
        };
        /** Items[ObservationState] */
        Items_ObservationState_: {
            /** Items */
            items: components["schemas"]["ObservationState"][];
        };
        /**
         * JsonSchemaFormat
         * @description 命名的 JSON Schema 输出约束。
         */
        JsonSchemaFormat: {
            /** Name */
            name: string;
            /** Schema */
            schema: {
                [key: string]: unknown;
            };
            /** Strict */
            strict?: boolean;
        };
        /**
         * LaneView
         * @description 当前非终态持久 lane，与 manager 是否存在独立。
         */
        LaneView: {
            session: components["schemas"]["SessionRef"];
            /** Run Id */
            run_id: string | null;
            run: components["schemas"]["RunSnapshot"] | null;
        };
        /**
         * LifecycleStorageDescription
         * @description 当前实际 store 身份，包含显式注入覆盖后的 backend/path。
         */
        LifecycleStorageDescription: {
            /** Backend */
            backend: string;
            /** Source Id */
            source_id: string;
            /** Path */
            path: string | null;
        };
        /**
         * MCPServerOverride
         * @description 按原始 server 名覆盖 Iris 的准备与工具策略。
         */
        MCPServerOverride: {
            /** Required */
            required?: boolean | null;
            /** Trust Annotations */
            trust_annotations?: boolean | null;
            /** Startup Timeout Sec */
            startup_timeout_sec?: number | null;
            /** Tool Timeout Sec */
            tool_timeout_sec?: number | null;
        };
        /**
         * MaintenanceConfig
         * @description 宿主共享维护的空闲调度配置，不拥有领域生成预算。
         */
        MaintenanceConfig: {
            /**
             * Idle Seconds
             * @default 300
             */
            idle_seconds: number;
            /**
             * Min Pending Runs
             * @default 10
             */
            min_pending_runs: number;
        };
        /** @enum {string} */
        MaintenanceState: "idle" | "waiting_for_idle" | "waiting_for_materials" | "waiting_for_foreground" | "waiting_for_lock" | "running" | "closing";
        /**
         * MaintenanceView
         * @description 协调器对 exact resource 的真实短投影。
         */
        MaintenanceView: {
            /** Coordinator Id */
            coordinator_id: string;
            /** Revision */
            revision: number;
            /** Foreground Count */
            foreground_count: number;
            resource: components["schemas"]["ResourceMaintenanceView"];
        };
        /**
         * MediaView
         * @description 已登记图片的原图与模型副本地址。
         */
        MediaView: {
            /** Media Id */
            media_id: string;
            /** Name */
            name: string | null;
            /** Mime Type */
            mime_type: string;
            /** Width */
            width: number;
            /** Height */
            height: number;
            /** Original Url */
            original_url: string;
            /** Model Url */
            model_url: string;
        };
        /**
         * MemoryActor
         * @description 触发记忆操作的角色。
         * @enum {string}
         */
        MemoryActor: "sdk" | "agent" | "user" | "system";
        /**
         * MemoryArtifactRef
         * @description 记忆关联产物的本地相对引用。
         */
        MemoryArtifactRef: {
            /** Path */
            path: string;
            /**
             * Mime Type
             * @default text/plain
             */
            mime_type: string;
            /** Metadata */
            metadata?: {
                [key: string]: unknown;
            };
        };
        /**
         * MemoryCategory
         * @description 记忆目录类别。记录记忆属于哪个业务域。
         * @enum {string}
         */
        MemoryCategory: "user" | "feedback" | "reference" | "task" | "session";
        /**
         * MemoryConfig
         * @description 记忆系统声明式配置。
         */
        MemoryConfig: {
            /**
             * Enabled
             * @default false
             */
            enabled: boolean;
            /**
             * Root
             * @default .iris/memory
             */
            root: string;
            /**
             * Path
             * @default .iris/memory/memory.db
             */
            path: string;
            /** Read Namespaces */
            read_namespaces?: string[];
            /**
             * Write Namespace
             * @default project
             */
            write_namespace: string;
            overview?: components["schemas"]["MemoryOverviewConfig"];
            generation?: components["schemas"]["MemoryGenerationConfig"];
        };
        /**
         * MemoryConsumedRange
         * @description 一次成功 flush 实际消费的稳定原文半开区间。
         */
        MemoryConsumedRange: {
            /** Episode Id */
            episode_id: string;
            /** Record Id */
            record_id: string;
            /** Start */
            start: number;
            /** End */
            end: number;
        };
        /**
         * MemoryEpisode
         * @description 有明确材料边界的不可变经历，不代表已经提炼的知识。
         */
        MemoryEpisode: {
            /** Id */
            id?: string;
            /**
             * Namespace
             * @default project
             */
            namespace: string;
            /** @default sdk */
            source_type: components["schemas"]["MemorySourceType"];
            /**
             * Source Id
             * @default
             */
            source_id: string;
            /** Records */
            records: components["schemas"]["MemoryRecord"][];
            /** Metadata */
            metadata?: {
                [key: string]: unknown;
            };
            /** Created At */
            created_at?: string;
        };
        /**
         * MemoryEvent
         * @description 记忆审计事件。
         */
        MemoryEvent: {
            /** Id */
            id?: string;
            /**
             * Namespace
             * @default project
             */
            namespace: string;
            event_type: components["schemas"]["MemoryEventType"];
            /** @default sdk */
            actor: components["schemas"]["MemoryActor"];
            /** Item Id */
            item_id?: string | null;
            /** Episode Id */
            episode_id?: string | null;
            /** @default sdk */
            source_type: components["schemas"]["MemorySourceType"];
            /**
             * Source Id
             * @default
             */
            source_id: string;
            /** Before */
            before?: {
                [key: string]: unknown;
            } | null;
            /** After */
            after?: {
                [key: string]: unknown;
            } | null;
            /**
             * Reason
             * @default
             */
            reason: string;
            /** Metadata */
            metadata?: {
                [key: string]: unknown;
            };
            /** Created At */
            created_at?: string;
        };
        /**
         * MemoryEventType
         * @description 记忆审计事件类型。
         * @enum {string}
         */
        MemoryEventType: "observe" | "add" | "update" | "delete" | "supersede" | "search" | "context_include" | "flush" | "dream";
        /**
         * MemoryEvidenceRef
         * @description 指向经历内原文片段或真实显式写入事件的证据定位。
         */
        MemoryEvidenceRef: {
            /**
             * Kind
             * @enum {string}
             */
            kind: "episode" | "event";
            /** Source Id */
            source_id: string;
            /** Record Id */
            record_id?: string | null;
            /**
             * Start
             * @default 0
             */
            start: number;
            /** End */
            end?: number | null;
        };
        /**
         * MemoryGenerationConfig
         * @description 自动维护开关和各生成阶段的独立预算。
         */
        MemoryGenerationConfig: {
            /**
             * Enabled
             * @default false
             */
            enabled: boolean;
            /**
             * Flush Input Budget Tokens
             * @default 32000
             */
            flush_input_budget_tokens: number;
            /**
             * Flush Output Budget Tokens
             * @default 4000
             */
            flush_output_budget_tokens: number;
            /**
             * Dream Input Budget Tokens
             * @default 32000
             */
            dream_input_budget_tokens: number;
            /**
             * Dream Output Budget Tokens
             * @default 4000
             */
            dream_output_budget_tokens: number;
        };
        /**
         * MemoryItem
         * @description 包含当前支持证据的正式长期知识。
         */
        MemoryItem: {
            /** Id */
            id?: string;
            /**
             * Namespace
             * @default project
             */
            namespace: string;
            /** Text */
            text: string;
            /** @default user */
            category: components["schemas"]["MemoryCategory"];
            /** @default note */
            kind: components["schemas"]["MemoryItemKind"];
            /** @default active */
            status: components["schemas"]["MemoryItemStatus"];
            /** Superseded By */
            superseded_by?: string | null;
            /** @default sdk */
            source_type: components["schemas"]["MemorySourceType"];
            /**
             * Source Id
             * @default
             */
            source_id: string;
            /**
             * Reason
             * @default
             */
            reason: string;
            /**
             * Evidence
             * @default []
             */
            evidence: components["schemas"]["MemoryEvidenceRef"][];
            /** Artifacts */
            artifacts?: components["schemas"]["MemoryArtifactRef"][];
            /** Metadata */
            metadata?: {
                [key: string]: unknown;
            };
            /** Created At */
            created_at?: string;
            /** Updated At */
            updated_at?: string;
            /** Deleted At */
            deleted_at?: string | null;
        };
        /**
         * MemoryItemKind
         * @description 长期记忆条目类型。记录记忆的类别和性质。
         * @enum {string}
         */
        MemoryItemKind: "fact" | "preference" | "note" | "summary" | "task_state" | "correction";
        /**
         * MemoryItemStatus
         * @description 长期记忆条目状态。
         * @enum {string}
         */
        MemoryItemStatus: "active" | "deleted" | "superseded";
        /**
         * MemoryObservation
         * @description 从材料中提出的不可变观察，整理进度由 store 单独持有。
         */
        MemoryObservation: {
            /** Id */
            id?: string;
            /**
             * Namespace
             * @default project
             */
            namespace: string;
            /** Text */
            text: string;
            /**
             * Applicability
             * @default
             */
            applicability: string;
            /** @default user */
            category: components["schemas"]["MemoryCategory"];
            /** @default note */
            kind: components["schemas"]["MemoryItemKind"];
            /** Reason */
            reason: string;
            /** Evidence */
            evidence: components["schemas"]["MemoryEvidenceRef"][];
            /**
             * Target Item Ids
             * @default []
             */
            target_item_ids: string[];
            /**
             * Generation Model
             * @default
             */
            generation_model: string;
            /** Created At */
            created_at?: string;
        };
        /**
         * MemoryOverviewConfig
         * @description 显式概览生成与后续窗口采用的独立预算配置。
         */
        MemoryOverviewConfig: {
            /**
             * Input Budget Tokens
             * @default 96000
             */
            input_budget_tokens: number;
            /**
             * Max Tokens
             * @default 4096
             */
            max_tokens: number;
            /**
             * System Budget Ratio
             * @default 0.02
             */
            system_budget_ratio: number;
        };
        /**
         * MemoryOverviewDocument
         * @description 供窗口采用的完整概览、知识范围节和读后新鲜度。
         */
        MemoryOverviewDocument: {
            /** Namespace */
            namespace: string;
            /**
             * Path
             * Format: path
             */
            path: string;
            /** Source Revision */
            source_revision: number | null;
            /** Text */
            text: string;
            /** Navigation */
            navigation: string;
            /** Warning */
            warning?: string | null;
        };
        /**
         * MemoryPublicationDocument
         * @description 发布 owner 确认写入的完整文档正文。
         */
        MemoryPublicationDocument: {
            /** Path */
            path: string;
            /** Text */
            text: string;
        };
        /**
         * MemoryPublicationRecord
         * @description 一次概览或分类发布的结果，部分文件成功不等于完整投影成功。
         */
        MemoryPublicationRecord: {
            /** Publication Id */
            publication_id?: string;
            /**
             * Kind
             * @enum {string}
             */
            kind: "projection" | "overview";
            /** Namespace */
            namespace: string;
            /** Item Revision */
            item_revision: number;
            /**
             * Status
             * @enum {string}
             */
            status: "published" | "failed" | "conflict" | "unconfirmed";
            /** Projection Revision */
            projection_revision?: number | null;
            /** Generation Result Id */
            generation_result_id?: string | null;
            /**
             * Documents
             * @default []
             */
            documents: components["schemas"]["MemoryPublicationDocument"][];
            /** Error */
            error?: string | null;
            /** Created At */
            created_at?: string;
        };
        /**
         * MemoryRecord
         * @description Episode 内具有稳定标识的原始材料记录。
         */
        MemoryRecord: {
            /** Id */
            id?: string;
            /**
             * Role
             * @default sdk
             */
            role: string;
            /**
             * Text
             * @default
             */
            text: string;
            /** @default sdk */
            source_type: components["schemas"]["MemorySourceType"];
            /**
             * Source Id
             * @default
             */
            source_id: string;
            /** Occurred At */
            occurred_at?: string;
            /**
             * Artifacts
             * @default []
             */
            artifacts: components["schemas"]["MemoryArtifactRef"][];
            /** Metadata */
            metadata?: {
                [key: string]: unknown;
            };
        };
        /**
         * MemorySourceType
         * @description 记忆来源类型。
         * @enum {string}
         */
        MemorySourceType: "message" | "tool_event" | "artifact" | "task" | "reference" | "sdk" | "generation";
        /**
         * MessagePage
         * @description 绝对消息位置是浏览器去重身份。
         */
        MessagePage: {
            /** Items */
            items: components["schemas"]["UiMessage"][];
            /** Next Index */
            next_index: number | null;
            /** Total Count */
            total_count: number;
        };
        /**
         * MiddlewareConfig
         * @description 只开放普通工具包装链的 Middleware 配置。
         */
        MiddlewareConfig: {
            /**
             * Tools
             * @default []
             */
            tools: components["schemas"]["ToolMiddlewareConfig"][];
        };
        /**
         * ModelCallRecord
         * @description 原 span 属性、事件以及完整内容与截断预览的不同状态。
         */
        ModelCallRecord: {
            summary: components["schemas"]["ModelCallSummary"];
            /** Attributes */
            attributes: {
                [key: string]: unknown;
            };
            /** Events */
            events: {
                [key: string]: unknown;
            }[];
            input: components["schemas"]["Observation_Any_"];
            output: components["schemas"]["Observation_Any_"];
            tool_definitions: components["schemas"]["Observation_Any_"];
            /** Truncated Fields */
            truncated_fields: string[];
            /** Previews */
            previews: {
                [key: string]: unknown;
            };
        };
        /**
         * ModelCallSummary
         * @description 真实模型 span 的身份、时间和已报告用量。
         */
        ModelCallSummary: {
            /** Record Id */
            record_id: string;
            /** Source */
            source: components["schemas"]["RunRef"] | components["schemas"]["ResourceRef"] | null;
            /** Trace Id */
            trace_id: string;
            /** Span Id */
            span_id: string;
            /** Parent Span Id */
            parent_span_id: string | null;
            /** Activation Id */
            activation_id?: string | null;
            /** Step Index */
            step_index?: number | null;
            /** Purpose */
            purpose?: string | null;
            /** Model Stream Id */
            model_stream_id?: string | null;
            /**
             * Started At
             * Format: date-time
             */
            started_at: string;
            /**
             * Ended At
             * Format: date-time
             */
            ended_at: string;
            /** Outcome */
            outcome: string;
            /** Request Model */
            request_model?: string | null;
            /** Response Model */
            response_model?: string | null;
            /** Input Tokens */
            input_tokens?: number | null;
            /** Output Tokens */
            output_tokens?: number | null;
            /** Preparation Id */
            preparation_id?: string | null;
            /** Configuration Snapshot Id */
            configuration_snapshot_id?: string | null;
        };
        /**
         * ModelConfig
         * @description 模型路由配置。
         *
         *     Attributes:
         *         provider (str): Provider 名称，例如 `openai`。
         *         name (str): Provider 下的模型名，例如 `gpt-4o-mini`。
         *         api_style: Provider 协议，默认 responses，可显式选择 chat_completions。
         *         base_url (str | None): 可选 provider base URL。
         *         temperature (float | None): 采样温度。
         *         top_p (float | None): nucleus sampling 参数。
         *         max_tokens (int | None): 最大输出 token 数。
         *         tool_choice (ToolChoice | None): 策略或仅含 name 的强制工具选择。
         *         response_format (ResponseFormat | None): 文本、JSON object 或命名 JSON Schema。
         *         timeout (float | None): 单次请求超时时间，单位秒。
         *         provider_options (dict[str, Any]): 少量 provider 专属选项。
         *         metadata (dict[str, Any]): 请求级元数据。
         */
        ModelConfig: {
            /** Provider */
            provider: string;
            /** Name */
            name: string;
            /**
             * Api Style
             * @default responses
             * @enum {string}
             */
            api_style: "responses" | "chat_completions";
            /** Base Url */
            base_url?: string | null;
            /** Temperature */
            temperature?: number | null;
            /** Top P */
            top_p?: number | null;
            /** Max Tokens */
            max_tokens?: number | null;
            /** Tool Choice */
            tool_choice?: ("auto" | "none" | "required") | components["schemas"]["NamedToolChoice"] | null;
            /** Response Format */
            response_format?: ("text" | "json_object") | components["schemas"]["JsonSchemaFormat"] | null;
            /** Timeout */
            timeout?: number | null;
            /** Provider Options */
            provider_options?: {
                [key: string]: unknown;
            };
            /** Metadata */
            metadata?: {
                [key: string]: unknown;
            };
        };
        /**
         * ModelStreamLink
         * @description Runtime 原事件确认的模型流与步骤关联。
         */
        ModelStreamLink: {
            /** Run Id */
            run_id: string;
            /** Activation Id */
            activation_id: string;
            /** Step Index */
            step_index: number;
            /** Model Stream Id */
            model_stream_id: string;
            /** Preparation Id */
            preparation_id: string | null;
        };
        /**
         * Msg
         * @description 通用消息单元。
         *
         *     每一次交互（用户输入、LLM 回复、工具调用、工具结果）
         *     都表示为一个 `Msg`。这样可在系统内保持内存、序列化与
         *     API 格式的一致性。
         *
         *     Attributes:
         *         role: 发送方角色。
         *         content: 纯字符串或内容块列表。
         *         sender: 可选发送方名称（多 agent 场景）。
         *         timestamp: 消息创建时的 Unix 时间戳（秒）。
         *         metadata: 任意键值元数据（如链路追踪、成本统计）。
         *
         *     Examples:
         *         >>> user_msg = Msg.user("修复 main.py 里的 bug")
         *         >>> user_msg.role
         *         <Role.USER: 'user'>
         *         >>> user_msg.text
         *         '修复 main.py 里的 bug'
         *
         *         >>> tool_result_msg = Msg.tool_result(tool_use_id="tool_abc", content="OK", is_error=False)
         *         >>> tool_result_msg.role
         *         <Role.USER: 'user'>
         */
        Msg: {
            role: components["schemas"]["Role"];
            /**
             * Content
             * @default
             */
            content: string | (components["schemas"]["TextBlock"] | components["schemas"]["ImageBlock"] | components["schemas"]["ToolUseBlock"] | components["schemas"]["ToolResultBlock"])[];
            /**
             * Sender
             * @default
             */
            sender: string;
            /** Timestamp */
            timestamp?: number;
            /** Metadata */
            metadata?: {
                [key: string]: unknown;
            };
        };
        /**
         * NamedToolChoice
         * @description 指定本次请求必须调用的逻辑工具。
         */
        NamedToolChoice: {
            /** Name */
            name: string;
        };
        /**
         * ObservationState
         * @description 观察的历史处理结果，区别于当前 Item 支持关系。
         */
        ObservationState: {
            observation: components["schemas"]["MemoryObservation"];
            /** Status */
            status: string;
            /** Item Id */
            item_id?: string | null;
            /**
             * Reason
             * @default
             */
            reason: string;
            /** Blocked Budget */
            blocked_budget?: number | null;
            /**
             * Dependency Item Ids
             * @default []
             */
            dependency_item_ids: string[];
        };
        /** Observation[Any] */
        Observation_Any_: {
            /**
             * Status
             * @enum {string}
             */
            status: "available" | "disabled" | "not_triggered" | "not_collected";
            /** Reason */
            reason?: string | null;
            /** Data */
            data?: unknown;
        };
        /** Observation[ContextPreparation] */
        Observation_ContextPreparation_: {
            /**
             * Status
             * @enum {string}
             */
            status: "available" | "disabled" | "not_triggered" | "not_collected";
            /** Reason */
            reason?: string | null;
            data?: components["schemas"]["ContextPreparation"] | null;
        };
        /** Observation[EvolutionResult] */
        Observation_EvolutionResult_: {
            /**
             * Status
             * @enum {string}
             */
            status: "available" | "disabled" | "not_triggered" | "not_collected";
            /** Reason */
            reason?: string | null;
            data?: components["schemas"]["EvolutionResult"] | null;
        };
        /** Observation[FileChange] */
        Observation_FileChange_: {
            /**
             * Status
             * @enum {string}
             */
            status: "available" | "disabled" | "not_triggered" | "not_collected";
            /** Reason */
            reason?: string | null;
            data?: components["schemas"]["FileChange"] | null;
        };
        /** Observation[GoalView] */
        Observation_GoalView_: {
            /**
             * Status
             * @enum {string}
             */
            status: "available" | "disabled" | "not_triggered" | "not_collected";
            /** Reason */
            reason?: string | null;
            data?: components["schemas"]["GoalView"] | null;
        };
        /** Observation[SkillDocument] */
        Observation_SkillDocument_: {
            /**
             * Status
             * @enum {string}
             */
            status: "available" | "disabled" | "not_triggered" | "not_collected";
            /** Reason */
            reason?: string | null;
            data?: components["schemas"]["SkillDocument"] | null;
        };
        /** Observation[TodoDocument] */
        Observation_TodoDocument_: {
            /**
             * Status
             * @enum {string}
             */
            status: "available" | "disabled" | "not_triggered" | "not_collected";
            /** Reason */
            reason?: string | null;
            data?: components["schemas"]["TodoDocument"] | null;
        };
        /** Observation[TodoSnapshot] */
        Observation_TodoSnapshot_: {
            /**
             * Status
             * @enum {string}
             */
            status: "available" | "disabled" | "not_triggered" | "not_collected";
            /** Reason */
            reason?: string | null;
            data?: components["schemas"]["TodoSnapshot"] | null;
        };
        /**
         * OperationAccepted
         * @description 已被主机持有的操作引用。
         */
        OperationAccepted: {
            /** Request Id */
            request_id: string;
            /** Operation Id */
            operation_id: string;
            /** Backend Epoch */
            backend_epoch: string;
            /** Location */
            location: string;
        };
        /**
         * OperationView
         * @description 进程内任务观察，不是持久业务队列。
         */
        OperationView: {
            /** Operation Id */
            operation_id: string;
            /** Backend Epoch */
            backend_epoch: string;
            /**
             * Kind
             * @enum {string}
             */
            kind: "apply" | "retire" | "maintenance" | "export" | "import";
            /**
             * State
             * @default running
             * @enum {string}
             */
            state: "running" | "succeeded" | "failed";
            /** Blockers */
            blockers?: {
                [key: string]: unknown;
            }[];
            /** Result */
            result?: unknown | null;
            error?: components["schemas"]["ApiError"] | null;
        };
        /** Page[ChildRunSummary] */
        Page_ChildRunSummary_: {
            /** Items */
            items: components["schemas"]["ChildRunSummary"][];
            /** Next Cursor */
            next_cursor?: string | null;
        };
        /** Page[ContextPreparationSummary] */
        Page_ContextPreparationSummary_: {
            /** Items */
            items: components["schemas"]["ContextPreparationSummary"][];
            /** Next Cursor */
            next_cursor?: string | null;
        };
        /** Page[ForkPoint] */
        Page_ForkPoint_: {
            /** Items */
            items: components["schemas"]["ForkPoint"][];
            /** Next Cursor */
            next_cursor?: string | null;
        };
        /** Page[GenerationResult] */
        Page_GenerationResult_: {
            /** Items */
            items: components["schemas"]["GenerationResult"][];
            /** Next Cursor */
            next_cursor?: string | null;
        };
        /** Page[MemoryEpisode] */
        Page_MemoryEpisode_: {
            /** Items */
            items: components["schemas"]["MemoryEpisode"][];
            /** Next Cursor */
            next_cursor?: string | null;
        };
        /** Page[MemoryPublicationRecord] */
        Page_MemoryPublicationRecord_: {
            /** Items */
            items: components["schemas"]["MemoryPublicationRecord"][];
            /** Next Cursor */
            next_cursor?: string | null;
        };
        /** Page[ModelCallSummary] */
        Page_ModelCallSummary_: {
            /** Items */
            items: components["schemas"]["ModelCallSummary"][];
            /** Next Cursor */
            next_cursor?: string | null;
        };
        /** Page[PublicationSummary] */
        Page_PublicationSummary_: {
            /** Items */
            items: components["schemas"]["PublicationSummary"][];
            /** Next Cursor */
            next_cursor?: string | null;
        };
        /** Page[RevisionRequestSummary] */
        Page_RevisionRequestSummary_: {
            /** Items */
            items: components["schemas"]["RevisionRequestSummary"][];
            /** Next Cursor */
            next_cursor?: string | null;
        };
        /** Page[RunSnapshot] */
        Page_RunSnapshot_: {
            /** Items */
            items: components["schemas"]["RunSnapshot"][];
            /** Next Cursor */
            next_cursor?: string | null;
        };
        /** Page[SessionSummary] */
        Page_SessionSummary_: {
            /** Items */
            items: components["schemas"]["SessionSummary"][];
            /** Next Cursor */
            next_cursor?: string | null;
        };
        /** Page[ShowcaseView] */
        Page_ShowcaseView_: {
            /** Items */
            items: components["schemas"]["ShowcaseView"][];
            /** Next Cursor */
            next_cursor?: string | null;
        };
        /** Page[SourceAdopted] */
        Page_SourceAdopted_: {
            /** Items */
            items: components["schemas"]["SourceAdopted"][];
            /** Next Cursor */
            next_cursor?: string | null;
        };
        /**
         * PendingSubmission
         * @description 尚未完成投递的进程内输入；块序列使用 tuple 保持只读。
         */
        PendingSubmission: {
            /** Submission Id */
            submission_id: string;
            /** Run Id */
            run_id: string;
            /** Mode */
            mode: ("steer" | "follow_up") | null;
            /** Input */
            input: string | (components["schemas"]["TextBlock"] | components["schemas"]["ImageBlock"])[];
            /**
             * Stage
             * @enum {string}
             */
            stage: "queued" | "committing" | "admitting";
            /**
             * Submitted At
             * Format: date-time
             */
            submitted_at: string;
        };
        /**
         * PermissionInteractionResponse
         * @description 人工对权限请求的单次决定。
         */
        PermissionInteractionResponse: {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            kind: "permission";
            /**
             * Decision
             * @enum {string}
             */
            decision: "approve" | "reject";
        };
        /**
         * PermissionPrompt
         * @description 向人展示的一次工具权限确认。
         */
        PermissionPrompt: {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            kind: "permission";
            /** Reason */
            reason: string;
        };
        /**
         * PermissionsConfig
         * @description 权限声明配置。
         *
         *     Attributes:
         *         workspace (str): Agent 工作区路径。
         *         writes (Literal["confirm", "allow", "deny"]): 写入策略。
         *         execute (Literal["confirm", "allow", "deny"]): 独立命令执行策略。
         */
        PermissionsConfig: {
            /**
             * Workspace
             * @default .
             */
            workspace: string;
            /**
             * Writes
             * @default confirm
             * @enum {string}
             */
            writes: "confirm" | "allow" | "deny";
            /**
             * Execute
             * @default confirm
             * @enum {string}
             */
            execute: "confirm" | "allow" | "deny";
        };
        /**
         * ProfileImported
         * @description 导入不会启动模型。
         */
        ProfileImported: {
            profile: components["schemas"]["ProfileView"];
            draft: components["schemas"]["ConfigDraft"];
            validation: components["schemas"]["ConfigValidation"];
        };
        /**
         * ProfileInput
         * @description 保留原 YAML 位置。
         */
        ProfileInput: {
            /** Workspace Id */
            workspace_id: string;
            /** Config Path */
            config_path: string;
            /** Title */
            title?: string | null;
        };
        /**
         * ProfileView
         * @description 原配置文件入口。
         */
        ProfileView: {
            /** Profile Id */
            profile_id: string;
            /** Workspace Id */
            workspace_id: string;
            /** Title */
            title: string;
            /** Config Path */
            config_path: string;
            /** Saved Revision Id */
            saved_revision_id?: string | null;
            /** Latest Generation Id */
            latest_generation_id?: string | null;
        };
        /**
         * PromptConfig
         * @description 相对 root workspace 解析的模板目录。
         */
        PromptConfig: {
            /**
             * Root
             * @default .iris/prompts
             */
            root: string;
        };
        /**
         * ProposedIssueSummary
         * @description 已提出但尚未形成正式请求的问题摘要，不包含完整材料。
         */
        ProposedIssueSummary: {
            /** Description */
            description: string;
            /** Targets */
            targets: components["schemas"]["RevisionTarget"][];
        };
        /**
         * PublicationDocument
         * @description 当时读取、候选或确认写入的正文；None 明确表示文件缺失。
         */
        PublicationDocument: {
            /** Path */
            path: string;
            /** Text */
            text: string | null;
        };
        /**
         * PublicationHistoryEntry
         * @description 发布历史及详情留存状态；过期后仍保留结果与必要证据。
         */
        PublicationHistoryEntry: {
            summary: components["schemas"]["PublicationSummary"];
            detail: components["schemas"]["PublicationRecord"] | null;
            /**
             * Evidence
             * @default []
             */
            evidence: components["schemas"]["RevisionEvidence"][];
            proposed_issue_summary?: components["schemas"]["ProposedIssueSummary"] | null;
        };
        /**
         * PublicationRecord
         * @description 一次原发布 owner 的基线、候选、真实结果及材料结算事实。
         */
        PublicationRecord: {
            /** Publication Id */
            publication_id?: string;
            /** Revision Id */
            revision_id?: string | null;
            /**
             * Stage
             * @enum {string}
             */
            stage: "experience" | "revision";
            /**
             * Created At
             * Format: date-time
             */
            created_at?: string;
            outcome?: components["schemas"]["EvolutionResult"] | null;
            /**
             * Publication State
             * @default not_published
             * @enum {string}
             */
            publication_state: "not_published" | "confirmed" | "unconfirmed";
            /**
             * Origin
             * @enum {string}
             */
            origin: "host_request" | "experience";
            /** Description */
            description: string;
            /**
             * Evidence Refs
             * @default []
             */
            evidence_refs: components["schemas"]["RevisionEvidence"][];
            /**
             * Consumed Ranges
             * @default []
             */
            consumed_ranges: components["schemas"]["EvolutionRange"][];
            /**
             * Targets
             * @default []
             */
            targets: components["schemas"]["RevisionTarget"][];
            /**
             * Before Documents
             * @default []
             */
            before_documents: components["schemas"]["PublicationDocument"][];
            /**
             * Candidate Documents
             * @default []
             */
            candidate_documents: components["schemas"]["PublicationDocument"][];
            /**
             * Observed Documents
             * @default []
             */
            observed_documents: components["schemas"]["PublicationDocument"][];
            /**
             * Reason
             * @default
             */
            reason: string;
            /** Usage */
            usage?: {
                [key: string]: number;
            };
            /**
             * Effect
             * @default
             */
            effect: string;
            /** Published At */
            published_at?: string | null;
            /**
             * Settled
             * @default false
             */
            settled: boolean;
            request?: components["schemas"]["RevisionItem"] | null;
            /**
             * Materials
             * @default []
             */
            materials: components["schemas"]["EvolutionMaterial"][];
            proposed_issue?: components["schemas"]["RevisionItem"] | null;
        };
        /**
         * PublicationSummary
         * @description 历史列表的短元数据，不读取或携带正文、材料与证据。
         */
        PublicationSummary: {
            /** Publication Id */
            publication_id: string;
            /** Revision Id */
            revision_id: string | null;
            /**
             * Created At
             * Format: date-time
             */
            created_at: string;
            /**
             * Stage
             * @enum {string}
             */
            stage: "experience" | "revision";
            /**
             * Origin
             * @enum {string}
             */
            origin: "host_request" | "experience";
            /** Description */
            description: string;
            /** Targets */
            targets: components["schemas"]["RevisionTarget"][];
            status: components["schemas"]["EvolutionStatus"] | null;
            /**
             * Publication State
             * @enum {string}
             */
            publication_state: "not_published" | "confirmed" | "unconfirmed";
            /** Reason */
            reason: string;
            /** Published At */
            published_at: string | null;
            /** Settled */
            settled: boolean;
            /**
             * Detail Status
             * @default available
             * @enum {string}
             */
            detail_status: "available" | "expired";
            /** Proposed Revision Id */
            proposed_revision_id?: string | null;
        };
        /**
         * PythonHookHandlerConfig
         * @description 由同步工厂构造 Python 异步处理器的声明。
         */
        PythonHookHandlerConfig: {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            type: "python";
            factory: components["schemas"]["_NonemptyText"];
            /** Options */
            options?: {
                [key: string]: unknown;
            };
        };
        /**
         * PythonToolsConfig
         * @description Python 引用扩展配置。
         *
         *     Attributes:
         *         functions (list[str]): 直接注册的 `module:function` 工具函数引用。
         *         registrars (list[str]): 接收 `ToolRegistry` 的批量注册函数引用。
         */
        PythonToolsConfig: {
            /** Functions */
            functions?: string[];
            /** Registrars */
            registrars?: string[];
        };
        /**
         * QuestionInteractionResponse
         * @description 人工对问题请求的自由文本回答。
         */
        QuestionInteractionResponse: {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            kind: "question";
            /** Answer */
            answer: string;
        };
        /**
         * QuestionPrompt
         * @description 向人展示的一次信息问题。
         */
        QuestionPrompt: {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            kind: "question";
            /** Question */
            question: string;
            /** Options */
            options?: string[];
        };
        /**
         * RecoverySource
         * @description 独立恢复实例采用的原实例身份。
         */
        RecoverySource: {
            /** Selected Generation Id */
            selected_generation_id: string;
            /** Selected Store Binding Id */
            selected_store_binding_id: string;
        };
        /**
         * RequestBody
         * @description 宿主请求关联，不提供隐式幂等保证。
         */
        RequestBody: {
            /** Request Id */
            request_id?: string | null;
        };
        /**
         * RequestId
         * @description 可选请求关联，不提供幂等承诺。
         */
        RequestId: {
            /** Request Id */
            request_id?: string | null;
        };
        /**
         * ResourceMaintenanceView
         * @description 一个 Memory 或 Evolution 资源的当前调度事实。
         */
        ResourceMaintenanceView: {
            /** Resource Ref */
            resource_ref: string;
            state: components["schemas"]["MaintenanceState"];
            /** Pending Request Id */
            pending_request_id?: string | null;
            /** Cycle Id */
            cycle_id?: string | null;
            /** Next Eligible At */
            next_eligible_at?: string | null;
            /** Last Result Ref */
            last_result_ref?: string | null;
            /**
             * Pending New Runs
             * @default 0
             */
            pending_new_runs: number;
            /**
             * Min Pending Runs
             * @default 10
             */
            min_pending_runs: number;
        };
        /**
         * ResourceRef
         * @description 维护资源的主机与领域身份。
         */
        ResourceRef: {
            /** Resource Id */
            resource_id: string;
            /** Resource Ref */
            resource_ref: string;
            /**
             * Kind
             * @enum {string}
             */
            kind: "memory" | "evolution";
            /** Display Name */
            display_name: string;
        };
        /**
         * ResourcesView
         * @description Generation 实际借用的资源。
         */
        ResourcesView: {
            /** Resources */
            resources: components["schemas"]["ResourceRef"][];
        };
        /**
         * RestoreAccepted
         * @description 实际接管实例及领域恢复回执。
         */
        RestoreAccepted: {
            /** Request Id */
            request_id: string;
            /** Generation Id */
            generation_id: string;
            receipt: components["schemas"]["RestoreReceipt"];
        };
        /**
         * RestoreInput
         * @description 显式恢复 Run 与 activation fence。
         */
        RestoreInput: {
            /** Request Id */
            request_id?: string | null;
            /** Generation Id */
            generation_id: string;
            /** Run Id */
            run_id: string;
            /** Expected Activation Id */
            expected_activation_id?: string | null;
        };
        /**
         * RestoreReceipt
         * @description 显式接管达到的状态；不表示整个 Run 已完成。
         */
        RestoreReceipt: {
            /** Run Id */
            run_id: string;
            /**
             * Disposition
             * @enum {string}
             */
            disposition: "already_managed" | "attached_waiting" | "recovery_started" | "settled";
            control: components["schemas"]["SessionControlSnapshot"];
        };
        /**
         * ResumeAccepted
         * @description 人工响应准入回执。
         */
        ResumeAccepted: {
            /** Request Id */
            request_id: string;
            receipt: components["schemas"]["ResumeReceipt"];
        };
        /**
         * ResumeReceipt
         * @description HITL 恢复已接纳的即时回执；最终结果由 runner 或事件流提供。
         */
        ResumeReceipt: {
            /** Run Id */
            run_id: string;
            /** Interaction Id */
            interaction_id: string;
        };
        /**
         * RevisionBody
         * @description 显式有限修订请求。
         */
        RevisionBody: {
            /** Request Id */
            request_id?: string | null;
            /** Description */
            description: string;
            /** Targets */
            targets: components["schemas"]["RevisionTarget"][];
            session?: components["schemas"]["SessionRef"] | null;
        };
        /**
         * RevisionEvidence
         * @description 问题引用的已有记录与必要原文片段。
         */
        RevisionEvidence: {
            /** Ref */
            ref: string;
            /** Quote */
            quote: string;
        };
        /**
         * RevisionInput
         * @description 指定要验证或保存的草稿。
         */
        RevisionInput: {
            /** Draft Revision */
            draft_revision: number;
        };
        /**
         * RevisionItem
         * @description B 的有界工作项；经历问题和宿主请求共享处理队列。
         */
        RevisionItem: {
            /** Id */
            id?: string;
            /**
             * Created At
             * Format: date-time
             */
            created_at?: string;
            /** Description */
            description: string;
            /** Targets */
            targets: components["schemas"]["RevisionTarget"][];
            /**
             * Evidence
             * @default []
             */
            evidence: components["schemas"]["RevisionEvidence"][];
            /** Origin */
            origin: components["schemas"]["ExperienceOrigin"] | components["schemas"]["HostOrigin"];
        };
        /**
         * RevisionRequestSummary
         * @description 修订请求列表的短元数据，status 仅表示请求的最终结算结果。
         */
        RevisionRequestSummary: {
            /** Id */
            id: string;
            /**
             * Created At
             * Format: date-time
             */
            created_at: string;
            /** Description */
            description: string;
            /** Targets */
            targets: components["schemas"]["RevisionTarget"][];
            /**
             * Origin
             * @enum {string}
             */
            origin: "host" | "experience";
            status?: components["schemas"]["EvolutionStatus"] | null;
        };
        /**
         * RevisionTarget
         * @description 候选目标身份；开放范围由 revision 边界拥有。
         */
        RevisionTarget: {
            /**
             * Kind
             * @enum {string}
             */
            kind: "prompt" | "config";
            /** Name */
            name: string;
        };
        /**
         * Role
         * @description 消息发送方角色，与常见 LLM API 约定保持一致。
         * @enum {string}
         */
        Role: "user" | "assistant" | "system" | "tool";
        /**
         * RunErrorInfo
         * @description Logical run 对外返回的结构化错误。
         */
        RunErrorInfo: {
            /** Code */
            code: string;
            /** Message */
            message: string;
            /**
             * Source
             * @enum {string}
             */
            source: "config" | "context" | "provider" | "tool" | "memory" | "session" | "runtime" | "lifecycle" | "persistence";
            /** Details */
            details?: {
                [key: string]: unknown;
            };
        };
        /**
         * RunEvent
         * @description 与 aggregate mutation 同事务追加的 durable 事件。
         */
        RunEvent: {
            /** Run Id */
            run_id: string;
            /** Session Id */
            session_id: string;
            /** Sequence */
            sequence: number;
            kind: components["schemas"]["RunEventKind"];
            /**
             * Occurred At
             * Format: date-time
             */
            occurred_at: string;
            /** Activation Id */
            activation_id?: string | null;
            /** Step Index */
            step_index?: number | null;
            /** Correlation Id */
            correlation_id?: string | null;
            /** Payload */
            payload?: {
                [key: string]: unknown;
            };
        };
        /**
         * RunEventKind
         * @description Lifecycle store 发布的 durable 事件类别。
         * @enum {string}
         */
        RunEventKind: "run.started" | "activation.started" | "model_step.reserved" | "model_step.committed" | "context.compacted" | "tool_call.claimed" | "tool_call.committed" | "tool_call.outcome_unknown" | "interaction.suspended" | "interaction.resolved" | "run.cancellation_requested" | "activation.abandoned" | "run.terminal";
        /**
         * RunHistory
         * @description 真实分支点末尾的历史前缀。
         */
        RunHistory: {
            point: components["schemas"]["ForkPoint"];
            /** Messages */
            messages: components["schemas"]["UiMessage"][];
        };
        /**
         * RunLimits
         * @description 一次 logical run 的固定预算与截止约束。
         */
        RunLimits: {
            /**
             * Max Model Steps
             * @default 20
             */
            max_model_steps: number;
            /** Deadline At */
            deadline_at?: string | null;
            /** Interaction Timeout Seconds */
            interaction_timeout_seconds?: number | null;
        };
        /**
         * RunPhase
         * @description Logical run 的外部可见阶段。
         * @enum {string}
         */
        RunPhase: "active" | "waiting" | "terminal";
        /**
         * RunRef
         * @description 跨存储运行身份。
         */
        RunRef: {
            /** Store Binding Id */
            store_binding_id: string;
            /** Source Id */
            source_id: string;
            /** Run Id */
            run_id: string;
        };
        /**
         * RunResult
         * @description Waiting 或 terminal run 的 durable 对外结果。
         */
        RunResult: {
            run: components["schemas"]["RunSnapshot"];
            assistant_message?: components["schemas"]["Msg"] | null;
            pending_interaction?: components["schemas"]["HumanInteraction"] | null;
            error?: components["schemas"]["RunErrorInfo"] | null;
        };
        /**
         * RunSnapshot
         * @description 调用方可观察的 logical run 不可变快照。
         */
        RunSnapshot: {
            /** Run Id */
            run_id: string;
            /** Session Id */
            session_id: string;
            /** Agent Id */
            agent_id: string;
            phase: components["schemas"]["RunPhase"];
            stop_reason?: components["schemas"]["RunStopReason"] | null;
            /** Revision */
            revision: number;
            /** Current Activation Id */
            current_activation_id?: string | null;
            /** Pending Interaction Id */
            pending_interaction_id?: string | null;
            /** Cancellation Requested At */
            cancellation_requested_at?: string | null;
            /** Cancellation Reason */
            cancellation_reason?: string | null;
            limits: components["schemas"]["RunLimits"];
            usage: components["schemas"]["RunUsage"];
            /** Checkpoint Sequence */
            checkpoint_sequence: number;
            /** Last Event Sequence */
            last_event_sequence: number;
            /**
             * Created At
             * Format: date-time
             */
            created_at: string;
            /**
             * Started At
             * Format: date-time
             */
            started_at: string;
            /**
             * Updated At
             * Format: date-time
             */
            updated_at: string;
            /** Finished At */
            finished_at?: string | null;
        };
        /**
         * RunStopReason
         * @description Terminal run 的稳定停止原因。
         * @enum {string}
         */
        RunStopReason: "completed" | "failed" | "cancelled" | "deadline_exceeded" | "interaction_expired" | "budget_exhausted" | "outcome_unknown";
        /**
         * RunUsage
         * @description Logical run 已持久化的预算和 token 计数。
         */
        RunUsage: {
            /**
             * Model Steps Reserved
             * @default 0
             */
            model_steps_reserved: number;
            /**
             * Model Steps Committed
             * @default 0
             */
            model_steps_committed: number;
            /**
             * Tool Calls Committed
             * @default 0
             */
            tool_calls_committed: number;
            /**
             * Input Tokens
             * @default 0
             */
            input_tokens: number;
            /**
             * Output Tokens
             * @default 0
             */
            output_tokens: number;
            /**
             * Total Tokens
             * @default 0
             */
            total_tokens: number;
            compaction?: components["schemas"]["TokenUsage"];
        };
        /**
         * RunView
         * @description 完整运行、结果与工具投影。
         */
        RunView: {
            ref: components["schemas"]["RunRef"];
            run: components["schemas"]["RunSnapshot"];
            result: components["schemas"]["RunResult"] | null;
            /** Tool Calls */
            tool_calls: components["schemas"]["UiToolCall"][];
        };
        /**
         * RuntimeExecutionOptions
         * @description 每次 activation 固定使用的 runtime 行为选项。
         */
        RuntimeExecutionOptions: {
            /**
             * Include Tools
             * @default true
             */
            include_tools: boolean;
            /** Request Options */
            request_options?: {
                [key: string]: unknown;
            };
            /** Tool Timeout Seconds */
            tool_timeout_seconds?: number | null;
            /** @default return_to_model */
            tool_error_policy: components["schemas"]["ToolErrorPolicy"];
        };
        /**
         * SaveInput
         * @description 逐文件保存的显式选择。
         */
        SaveInput: {
            /** Draft Revision */
            draft_revision: number;
            /** Document Ids */
            document_ids: string[];
        };
        /**
         * SaveResult
         * @description 只更新成功写入的文件基线。
         */
        SaveResult: {
            /** Config Revision Id */
            config_revision_id: string;
            /** Saved Document Ids */
            saved_document_ids: string[];
            draft: components["schemas"]["ConfigDraft"];
        };
        /**
         * SelectedArtifact
         * @description 用户选择随包复制的工具产物。
         */
        SelectedArtifact: {
            /** Store Binding Id */
            store_binding_id: string;
            /** Run Id */
            run_id: string;
            /** Tool Call Id */
            tool_call_id: string;
        };
        /**
         * SelectedPublication
         * @description 用户选择的当前可读发布记录。
         */
        SelectedPublication: {
            /** Resource Id */
            resource_id: string;
            /** Publication Id */
            publication_id: string;
        };
        /**
         * SelectedRun
         * @description 用户明确选择的存储与运行。
         */
        SelectedRun: {
            /** Store Binding Id */
            store_binding_id: string;
            /** Run Id */
            run_id: string;
        };
        /**
         * SessionBootstrap
         * @description 订阅 ready 后读取的有界独立事实集合。
         */
        SessionBootstrap: {
            session: components["schemas"]["SessionView"];
            control: components["schemas"]["SessionControlSnapshot"] | null;
            lane: components["schemas"]["LaneView"];
            current_run: components["schemas"]["RunView"] | null;
            messages: components["schemas"]["MessagePage"];
            /** Event Watermarks */
            event_watermarks: components["schemas"]["Watermark"][];
        };
        /**
         * SessionConfig
         * @description 会话持久化配置。
         *
         *     Attributes:
         *         backend (Literal["none", "sqlite"]): 会话后端。
         *         path (str | None): SQLite 文件路径。
         */
        SessionConfig: {
            /**
             * Backend
             * @default none
             * @enum {string}
             */
            backend: "none" | "sqlite";
            /** Path */
            path?: string | null;
        };
        /**
         * SessionControlSnapshot
         * @description 只读控制提示，revision 不参与 durable CAS。
         */
        SessionControlSnapshot: {
            /** Manager Id */
            manager_id: string;
            /** Revision */
            revision: number;
            /** Session Id */
            session_id: string;
            /** Current Run Id */
            current_run_id?: string | null;
            run?: components["schemas"]["RunSnapshot"] | null;
            /**
             * Driver State
             * @default idle
             * @enum {string}
             */
            driver_state: "idle" | "admitting" | "running" | "settling" | "detached" | "closed";
            /**
             * Pending
             * @default []
             */
            pending: components["schemas"]["PendingSubmission"][];
            /**
             * Allowed Commands
             * @default []
             */
            allowed_commands: string[];
            /**
             * Pending Scope
             * @default process_local
             * @constant
             */
            pending_scope: "process_local";
            interaction_status?: components["schemas"]["InteractionStatus"] | null;
        };
        /**
         * SessionRef
         * @description 跨存储会话身份。
         */
        SessionRef: {
            /** Store Binding Id */
            store_binding_id: string;
            /** Source Id */
            source_id: string;
            /** Session Id */
            session_id: string;
        };
        /**
         * SessionSummary
         * @description 不包含正文的根会话导航信息。
         */
        SessionSummary: {
            /** Session Id */
            session_id: string;
            /** Revision */
            revision: number;
            /** Message Count */
            message_count: number;
            /** Current Run Id */
            current_run_id: string | null;
            /** Latest Run Id */
            latest_run_id: string | null;
            /** Latest Run At */
            latest_run_at: string | null;
            /** Forked From Run Id */
            forked_from_run_id: string | null;
        };
        /**
         * SessionView
         * @description 已登记或持久存在的会话。
         */
        SessionView: {
            ref: components["schemas"]["SessionRef"];
            /** Title */
            title: string;
            /** Generation Id */
            generation_id?: string | null;
            /** Has Durable State */
            has_durable_state: boolean;
            /** Forked From Run Id */
            forked_from_run_id?: string | null;
        };
        /**
         * ShowcaseRecord
         * @description 可导入和离线读取的版本一展示包。
         */
        ShowcaseRecord: {
            /**
             * Schema Version
             * @default 1
             * @constant
             */
            schema_version: 1;
            /** Title */
            title: string;
            /**
             * Captured At
             * Format: date-time
             */
            captured_at: string;
            /** Runs */
            runs: components["schemas"]["ExportedRun"][];
            /** Publications */
            publications?: {
                [key: string]: unknown;
            }[];
            /** Assets */
            assets?: components["schemas"]["ExportAsset"][];
            /** Missing */
            missing?: string[];
        };
        /**
         * ShowcaseView
         * @description 主机保存的只读展示记录入口。
         */
        ShowcaseView: {
            /** Showcase Id */
            showcase_id: string;
            /** Title */
            title: string;
            /**
             * Created At
             * Format: date-time
             */
            created_at: string;
            /**
             * Source
             * @enum {string}
             */
            source: "exported" | "imported";
            /**
             * Read Only
             * @default true
             * @constant
             */
            read_only: true;
            /** Run Refs */
            run_refs: components["schemas"]["SelectedRun"][];
            /** Manifest Url */
            manifest_url: string;
            /** Record Url */
            record_url: string;
            /** Download Url */
            download_url: string;
            /** View Url */
            view_url: string;
        };
        /**
         * SkillDocument
         * @description 当前真实项目经验文件。
         */
        SkillDocument: {
            /** File Path */
            file_path: string;
            /** Text */
            text: string;
        };
        /**
         * SkillMetadata
         * @description 不包含正文的单条 Skill 元数据。
         */
        SkillMetadata: {
            /** Name */
            name: string;
            /** Description */
            description: string;
            scope: components["schemas"]["SkillScope"];
            /**
             * Skill File
             * Format: path
             */
            skill_file: string;
            /**
             * Root Dir
             * Format: path
             */
            root_dir: string;
            /** Relative Skill File */
            relative_skill_file: string;
            /** Root Index */
            root_index: number;
            /**
             * Description Truncated
             * @default false
             */
            description_truncated: boolean;
            /** Declared Name */
            declared_name?: string | null;
            /** Extra Frontmatter */
            extra_frontmatter?: {
                [key: string]: unknown;
            };
        };
        /**
         * SkillScope
         * @description Skill 的发现范围。
         * @enum {string}
         */
        SkillScope: "project";
        /**
         * SourceAdopted
         * @description 消费 owner 确认的来源快照；不表示任务效果已得到验证。
         */
        SourceAdopted: {
            /** Adoption Id */
            adoption_id: string;
            /** Owner Kind */
            owner_kind: string;
            /** Source Kind */
            source_kind: string;
            /** Adoption Boundary */
            adoption_boundary: string;
            /**
             * Adopted At
             * Format: date-time
             */
            adopted_at: string;
            /** Documents */
            documents: components["schemas"]["SourceDocument"][];
            /** Configuration Snapshot Id */
            configuration_snapshot_id?: string | null;
            /** Run Id */
            run_id?: string | null;
            /** Session Id */
            session_id?: string | null;
            /** Activation Id */
            activation_id?: string | null;
            /** Step Index */
            step_index?: number | null;
            /** Preparation Id */
            preparation_id?: string | null;
            /** Maintenance Cycle Id */
            maintenance_cycle_id?: string | null;
            /** Resource Ref */
            resource_ref?: string | null;
            /**
             * Source Versions
             * @default []
             */
            source_versions: [
                string,
                string | null
            ][];
        };
        /**
         * SourceDocument
         * @description 实际来源文本或明确的不可展示状态。
         */
        SourceDocument: {
            /** Kind */
            kind: string;
            /** Original Path */
            original_path: string | null;
            /** Text */
            text: string | null;
            /**
             * Status
             * @default captured
             * @enum {string}
             */
            status: "captured" | "redacted" | "not_utf8";
            /** Document Id */
            document_id?: string;
        };
        /** @enum {string} */
        SpeechAdapterName: "doubao_asr" | "dashscope_funasr";
        /**
         * SpeechConfig
         * @description 默认关闭的语音输入声明，由宿主显式装配客户端。
         */
        SpeechConfig: {
            /**
             * Enabled
             * @default false
             */
            enabled: boolean;
            adapter?: components["schemas"]["SpeechAdapterName"] | null;
            endpoint?: components["schemas"]["_ConnectionString"] | null;
            model?: components["schemas"]["_ConnectionString"] | null;
        };
        /**
         * StorageBindingView
         * @description 实际存储绑定。
         */
        StorageBindingView: {
            /** Store Binding Id */
            store_binding_id: string;
            /**
             * Backend
             * @enum {string}
             */
            backend: "memory" | "sqlite";
            /** Resolved Path */
            resolved_path?: string | null;
            /** Source Id */
            source_id: string;
            /**
             * Available
             * @default true
             */
            available: boolean;
        };
        /**
         * StoreSessions
         * @description workspace 内各存储独立分页。
         */
        StoreSessions: {
            /** Store Binding Id */
            store_binding_id: string;
            /** Source Id */
            source_id: string;
            page: components["schemas"]["Page_SessionSummary_"];
        };
        /**
         * SubagentExpiryOwner
         * @description Sub Agent proxy 最早到期期限的归属。
         * @enum {string}
         */
        SubagentExpiryOwner: "parent_run_deadline" | "parent_interaction_timeout" | "child_interaction_expiry" | "child_effective_deadline" | "outer_tool_timeout";
        /**
         * SubagentProxyOrigin
         * @description Parent proxy 所对应的 exact child interaction 与期限归属。
         */
        SubagentProxyOrigin: {
            /** Child Run Id */
            child_run_id: string;
            /** Child Interaction Id */
            child_interaction_id: string;
            /** Agent Selector */
            agent_selector: string;
            expiry_owner?: components["schemas"]["SubagentExpiryOwner"] | null;
        };
        /**
         * SubmissionAccepted
         * @description 输入已准入，不代表 Run 成功。
         */
        SubmissionAccepted: {
            /** Request Id */
            request_id: string;
            receipt: components["schemas"]["SubmitReceipt"];
        };
        /** @enum {string} */
        SubmissionMode: "steer" | "follow_up";
        /**
         * SubmitInput
         * @description 会话输入准入。
         */
        SubmitInput: {
            /** Request Id */
            request_id?: string | null;
            /** Input */
            input: string | (components["schemas"]["TextBlock"] | components["schemas"]["ImageInput"])[];
            /**
             * Mode
             * @default auto
             * @enum {string}
             */
            mode: "auto" | "steer" | "follow_up";
            options?: components["schemas"]["AgentRunOptions"] | null;
        };
        /**
         * SubmitReceipt
         * @description 一次普通输入 admission 的不可变即时回执。
         *
         *     只表达"输入是否已被接纳"，不表达 run 结果。idle submit 在 run create 已 durable commit
         *     后返回 ``delivered``；busy submit 一律返回 ``pending``，最终 delivery/failure 通过 host
         *     选择的 mixed stream 或 submission publisher 报告。
         *
         *     Attributes:
         *         submission_id (str): 该次提交的 process-local 标识。
         *         run_id (str): 绑定的 run id；follow-up 是预生成的 future run id。
         *         mode (SubmissionMode | None): busy 模式；None 表示 idle submit。
         *         state (Literal["pending", "delivered"]): 接纳状态。
         */
        SubmitReceipt: {
            /** Submission Id */
            submission_id: string;
            /** Run Id */
            run_id: string;
            mode: components["schemas"]["SubmissionMode"] | null;
            /**
             * State
             * @enum {string}
             */
            state: "pending" | "delivered";
        };
        /**
         * TextBlock
         * @description 用户或助手发送的纯文本内容。
         */
        TextBlock: {
            /**
             * Type
             * @default text
             * @constant
             */
            type: "text";
            /** Text */
            text: string;
        };
        /**
         * TextSlice
         * @description 有界读取真实工具正文。
         */
        TextSlice: {
            /** Text */
            text: string;
            /** Next Offset */
            next_offset: number | null;
            /** Has More */
            has_more: boolean;
        };
        /**
         * TitleInput
         * @description 主机标题变更。
         */
        TitleInput: {
            /** Title */
            title: string;
        };
        /**
         * TodoConfig
         * @description 控制当前 Agent 是否读取会话 Todo 清单。
         */
        TodoConfig: {
            /**
             * Enabled
             * @default false
             */
            enabled: boolean;
        };
        /**
         * TodoDocument
         * @description 当前 Todo 文件原文，缺失文件使用 null 基线。
         */
        TodoDocument: {
            /** Path */
            path: string;
            /** Text */
            text: string | null;
            snapshot: components["schemas"]["TodoSnapshot"];
        };
        /**
         * TodoEditBody
         * @description 原文基线比较一次，拒绝覆盖其他编辑。
         */
        TodoEditBody: {
            /** Base Text */
            base_text: string | null;
            /** Text */
            text: string;
        };
        /**
         * TodoItem
         * @description 保留原始顺序与内容的单个任务。
         */
        TodoItem: {
            /** Content */
            content: string;
            status: components["schemas"]["TodoStatus"];
        };
        /**
         * TodoSnapshot
         * @description 一次读取结果；格式错误时仅包含诊断而无有效条目。
         */
        TodoSnapshot: {
            /**
             * Path
             * Format: path
             */
            path: string;
            /** Items */
            items: components["schemas"]["TodoItem"][];
            /** Error */
            error: string | null;
        };
        /**
         * TodoStatus
         * @description 清单条目的三种工作状态。
         * @enum {string}
         */
        TodoStatus: "pending" | "in_progress" | "completed";
        /**
         * TokenUsage
         * @description Provider 返回的一组独立 token 计数。
         */
        TokenUsage: {
            /**
             * Input Tokens
             * @default 0
             */
            input_tokens: number;
            /**
             * Output Tokens
             * @default 0
             */
            output_tokens: number;
            /**
             * Total Tokens
             * @default 0
             */
            total_tokens: number;
        };
        /**
         * ToolCallPhase
         * @description 工具调用的 durable effect 状态。
         * @enum {string}
         */
        ToolCallPhase: "prepared" | "claimed" | "committed" | "outcome_unknown";
        /**
         * ToolCallSnapshot
         * @description 触发人工 gate 的精确工具调用身份。
         */
        ToolCallSnapshot: {
            /** Tool Call Id */
            tool_call_id: string;
            /** Tool Name */
            tool_name: string;
            /** Arguments */
            arguments: {
                [key: string]: unknown;
            };
            /** Workspace Root */
            workspace_root: string;
            /** Fingerprint */
            fingerprint: string;
        };
        /**
         * ToolCapability
         * @description 工具能力标签。
         * @enum {string}
         */
        ToolCapability: "read" | "write" | "execute" | "network" | "mcp" | "agent";
        /**
         * ToolDefinition
         * @description 工具注册、执行与模型可见投影使用的元数据和参数定义。
         *
         *     统一了所有工具的对外元数据，在 LLM 发现和挂载时作为标准格式读取。
         *
         *     Attributes:
         *         name (str): 暴露给 LLM 的工具名称。
         *         description (str): 提供给 LLM 的功能描述和参数说明。
         *         input_schema (dict[str, Any]): 工具参数的 JSON Schema，约束输入结构。
         *         capabilities (set[ToolCapability]): 安全隔离级别标识标签。
         *         group (str): 工具分类，通常用于批量注册或过滤。
         *         aliases (tuple[str, ...]): 可能的同义名称。
         *         deferred (bool): 标识是否延迟计算或初始化。
         *         max_result_chars (int): 执行结果文本的最长限制，防止输出撑爆上下文。
         *         preview_chars (int): 输出超长截断时提供给人类审查的最大字数。
         *         preview_mode (Literal["head", "head_tail"]): 正文预览保留前缀或头尾。
         *         context_retention (Literal["keep", "observation"]): 历史正文保留声明。
         *         metadata (dict[str, Any]): 存放其他拓展属性。
         *
         *     Example:
         *         defn = ToolDefinition(name="ls", description="List files", input_schema={"type": "object"})
         */
        ToolDefinition: {
            /** Name */
            name: string;
            /** Description */
            description: string;
            /** Input Schema */
            input_schema: {
                [key: string]: unknown;
            };
            /** Capabilities */
            capabilities?: components["schemas"]["ToolCapability"][];
            /**
             * Group
             * @default core
             */
            group: string;
            /**
             * Aliases
             * @default []
             */
            aliases: string[];
            /**
             * Deferred
             * @default false
             */
            deferred: boolean;
            /**
             * Max Result Chars
             * @default 50000
             */
            max_result_chars: number;
            /**
             * Preview Chars
             * @default 8000
             */
            preview_chars: number;
            /**
             * Preview Mode
             * @default head
             * @enum {string}
             */
            preview_mode: "head" | "head_tail";
            /**
             * Context Retention
             * @default keep
             * @enum {string}
             */
            context_retention: "keep" | "observation";
            /** Metadata */
            metadata?: {
                [key: string]: unknown;
            };
        };
        /**
         * ToolErrorInfo
         * @description 结构化工具错误。
         *
         *     统一包装内部报错后展示给 LLM，令其有机会在感知异常后执行自修正及重试。
         *
         *     Attributes:
         *         code (str): 错误特征常量串，用于标识失败的大致类型。
         *         message (str): 给模型及用户的更详尽具体错误原由解释。
         *         retryable (bool): 代表当前工具失败是否可通过修正输入后二次挽回。
         *         details (dict[str, Any]): 更底层的 traceback 之类的额外上下文。
         *
         *     Example:
         *         err = ToolErrorInfo(code="404", message="File not found")
         */
        ToolErrorInfo: {
            /** Code */
            code: string;
            /** Message */
            message: string;
            /**
             * Retryable
             * @default false
             */
            retryable: boolean;
            /** Details */
            details?: {
                [key: string]: unknown;
            };
        };
        /**
         * ToolErrorPolicy
         * @description 工具错误进入下一模型步或立即停止的策略。
         * @enum {string}
         */
        ToolErrorPolicy: "return_to_model" | "stop";
        /**
         * ToolMiddlewareConfig
         * @description 由同步工厂构造一个 ToolMiddleware 实例的声明。
         */
        ToolMiddlewareConfig: {
            factory: components["schemas"]["_NonemptyText"];
            /** Options */
            options?: {
                [key: string]: unknown;
            };
        };
        /**
         * ToolResultBlock
         * @description 工具执行后的返回结果。
         *
         *     Attributes:
         *         tool_use_id: 对应 `ToolUseBlock` 的 `id`。
         *         content: 工具执行产生的有序文字/图片数据块。
         *         is_error: 工具执行是否失败。
         *         name: 工具名称。
         *         metadata: 额外元数据。
         */
        ToolResultBlock: {
            /**
             * Type
             * @default tool_result
             * @constant
             */
            type: "tool_result";
            /** Tool Use Id */
            tool_use_id: string;
            /** Content */
            content?: (components["schemas"]["TextBlock"] | components["schemas"]["ImageBlock"])[];
            /**
             * Is Error
             * @default false
             */
            is_error: boolean;
            /**
             * Name
             * @default
             */
            name: string;
            /** Metadata */
            metadata?: {
                [key: string]: unknown;
            };
        };
        /**
         * ToolUseBlock
         * @description 由 LLM 发起的工具调用请求。
         *
         *     Attributes:
         *         id: 由 LLM 分配的唯一标识（用于关联结果）。
         *         name: 已注册的工具名（如 "bash"、"read_file"）。
         *         input: 工具参数，需可被 JSON 序列化。
         */
        ToolUseBlock: {
            /**
             * Type
             * @default tool_use
             * @constant
             */
            type: "tool_use";
            /** Id */
            id?: string;
            /** Name */
            name: string;
            /** Input */
            input?: {
                [key: string]: unknown;
            };
        };
        /**
         * ToolsConfig
         * @description 工具声明配置。
         *
         *     Attributes:
         *         builtin (list[str]): 内置工具公开 YAML 名称。
         *         python (PythonToolsConfig): Python 扩展引用配置。
         *         subagent (Path | None): 相对 parent YAML 的 Sub Agent catalog 路径。
         */
        ToolsConfig: {
            /** Builtin */
            builtin?: string[];
            python?: components["schemas"]["PythonToolsConfig"];
            /** Subagent */
            subagent?: string | null;
        };
        /**
         * UiImagePart
         * @description 可读取原图和模型副本的图片块。
         */
        UiImagePart: {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            type: "image";
            /** Name */
            name: string | null;
            media: components["schemas"]["MediaView"];
        };
        /**
         * UiMessage
         * @description 保留绝对位置和角色的持久消息。
         */
        UiMessage: {
            /** Ordinal */
            ordinal: number;
            role: components["schemas"]["Role"];
            /** Sender */
            sender: string;
            /** Timestamp */
            timestamp: number;
            /** Parts */
            parts: (components["schemas"]["UiTextPart"] | components["schemas"]["UiImagePart"] | components["schemas"]["UiToolUsePart"] | components["schemas"]["UiToolResultPart"])[];
            /** Metadata */
            metadata: {
                [key: string]: unknown;
            };
        };
        /**
         * UiTextPart
         * @description 文字内容块。
         */
        UiTextPart: {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            type: "text";
            /** Text */
            text: string;
        };
        /**
         * UiToolCall
         * @description 完整工具调用记录的前端读面。
         */
        UiToolCall: {
            /** Run Id */
            run_id: string;
            /** Step Index */
            step_index: number;
            /** Ordinal */
            ordinal: number;
            /** Tool Call Id */
            tool_call_id: string;
            /** Tool Name */
            tool_name: string;
            /** Arguments */
            arguments: {
                [key: string]: unknown;
            };
            /** Fingerprint */
            fingerprint: string;
            /** Interaction Id */
            interaction_id: string | null;
            phase: components["schemas"]["ToolCallPhase"];
            /** Claim Activation Id */
            claim_activation_id: string | null;
            result: components["schemas"]["UiToolResult"] | null;
            /** Version */
            version: number;
            /**
             * Created At
             * Format: date-time
             */
            created_at: string;
            /**
             * Updated At
             * Format: date-time
             */
            updated_at: string;
            /** Claimed At */
            claimed_at: string | null;
            /** Committed At */
            committed_at: string | null;
        };
        /**
         * UiToolResult
         * @description 完整工具结果，只替换媒体和产物的传输投影。
         */
        UiToolResult: {
            /** Tool Use Id */
            tool_use_id: string;
            /** Tool Name */
            tool_name: string;
            /** Content */
            content: (components["schemas"]["UiTextPart"] | components["schemas"]["UiImagePart"])[];
            /** Is Error */
            is_error: boolean;
            error: components["schemas"]["ToolErrorInfo"] | null;
            /** Data */
            data: {
                [key: string]: unknown;
            };
            artifact: components["schemas"]["ArtifactView"] | null;
            /** Stats */
            stats: {
                [key: string]: unknown;
            };
            /** Metadata */
            metadata: {
                [key: string]: unknown;
            };
            /** Hook Feedback */
            hook_feedback: string[];
        };
        /**
         * UiToolResultPart
         * @description 持久消息中的工具回执。
         */
        UiToolResultPart: {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            type: "tool_result";
            /** Tool Use Id */
            tool_use_id: string;
            /** Name */
            name: string;
            /** Content */
            content: (components["schemas"]["UiTextPart"] | components["schemas"]["UiImagePart"])[];
            /** Is Error */
            is_error: boolean;
            /** Metadata */
            metadata: {
                [key: string]: unknown;
            };
        };
        /**
         * UiToolUsePart
         * @description 模型的真实工具请求。
         */
        UiToolUsePart: {
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            type: "tool_use";
            /** Id */
            id: string;
            /** Name */
            name: string;
            /** Input */
            input: {
                [key: string]: unknown;
            };
        };
        /** ValidationError */
        ValidationError: {
            /** Location */
            loc: (string | number)[];
            /** Message */
            msg: string;
            /** Error Type */
            type: string;
            /** Input */
            input?: unknown;
            /** Context */
            ctx?: Record<string, never>;
        };
        /**
         * Watermark
         * @description 事实水位，不代表客户端已消费。
         */
        Watermark: {
            /** Run Id */
            run_id: string;
            /** Last Event Sequence */
            last_event_sequence: number;
        };
        /**
         * WorkspaceInput
         * @description 用户明确登记的工作目录。
         */
        WorkspaceInput: {
            /** Path */
            path: string;
            /** Title */
            title?: string | null;
        };
        /**
         * WorkspaceSessions
         * @description 分库存量与尚未执行的主机草稿。
         */
        WorkspaceSessions: {
            /** Stores */
            stores: components["schemas"]["StoreSessions"][];
            /** Drafts */
            drafts: components["schemas"]["SessionView"][];
        };
        /**
         * WorkspaceView
         * @description 已登记目录。
         */
        WorkspaceView: {
            /** Workspace Id */
            workspace_id: string;
            /** Path */
            path: string;
            /** Title */
            title: string;
        };
        _ConnectionString: string;
        _NonemptyText: string;
        UiPart: components["schemas"]["UiTextPart"] | components["schemas"]["UiImagePart"] | components["schemas"]["UiToolUsePart"] | components["schemas"]["UiToolResultPart"];
        /**
         * SpeechFinish
         * @description 浏览器结束录音，等待服务返回最终转录。
         */
        SpeechFinish: {
            /**
             * Type
             * @constant
             */
            type: "finish";
        };
        /**
         * SpeechTranscript
         * @description 语音事件是当前全文快照，不是增量文字。
         */
        SpeechTranscript: {
            /**
             * Type
             * @default transcript
             * @constant
             */
            type: "transcript";
            /** Text */
            text: string;
            /** Is Final */
            is_final: boolean;
        };
        /**
         * SpeechError
         * @description 语音输入失败，已有聊天与草稿不受影响。
         */
        SpeechError: {
            /**
             * Type
             * @default error
             * @constant
             */
            type: "error";
            /** Message */
            message: string;
        };
    };
    responses: never;
    parameters: never;
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
    bootstrap_api_bootstrap_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Bootstrap"];
                };
            };
        };
    };
    workspace_api_workspaces_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["WorkspaceInput"];
            };
        };
        responses: {
            /** @description Successful Response */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["WorkspaceView"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    import_profile_api_profiles_import_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ProfileInput"];
            };
        };
        responses: {
            /** @description Successful Response */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProfileImported"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    profile_api_profiles__profile_id__get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                profile_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProfileView"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    draft_api_profiles__profile_id__draft_get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                profile_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ConfigDraft"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    edit_draft_api_profiles__profile_id__draft_put: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                profile_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["DraftInput"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ConfigDraft"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    import_document_api_profiles__profile_id__documents_import_post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                profile_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["DocumentInput"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ConfigDraft"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    validate_api_profiles__profile_id__validate_post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                profile_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["RevisionInput"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ConfigValidation"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    save_api_profiles__profile_id__save_post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                profile_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["SaveInput"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SaveResult"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    apply_api_profiles__profile_id__apply_post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                profile_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ApplyInput"];
            };
        };
        responses: {
            /** @description Successful Response */
            202: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["OperationAccepted"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    generation_api_generations__generation_id__get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                generation_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GenerationView"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    configuration_api_generations__generation_id__configuration_get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                generation_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["EffectiveConfiguration"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    retire_api_generations__generation_id__retire_post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                generation_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["RequestId"];
            };
        };
        responses: {
            /** @description Successful Response */
            202: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["OperationAccepted"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    operation_api_operations__operation_id__get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                operation_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["OperationView"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    workspace_sessions_api_workspaces__workspace_id__sessions_get: {
        parameters: {
            query?: {
                cursors?: string | null;
                limit_per_store?: number;
            };
            header?: never;
            path: {
                workspace_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["WorkspaceSessions"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    sessions_api_stores__store_binding_id__sessions_get: {
        parameters: {
            query?: {
                after?: string | null;
                limit?: number;
            };
            header?: never;
            path: {
                store_binding_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Page_SessionSummary_"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    create_session_api_stores__store_binding_id__sessions_post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                store_binding_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateSessionInput"];
            };
        };
        responses: {
            /** @description Successful Response */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SessionView"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    session_api_stores__store_binding_id__sessions__session_id__get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                store_binding_id: string;
                session_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SessionView"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    title_api_stores__store_binding_id__sessions__session_id__patch: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                store_binding_id: string;
                session_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["TitleInput"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SessionView"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    bootstrap_api_stores__store_binding_id__sessions__session_id__bootstrap_get: {
        parameters: {
            query?: {
                message_limit?: number;
            };
            header?: never;
            path: {
                store_binding_id: string;
                session_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SessionBootstrap"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    control_api_stores__store_binding_id__sessions__session_id__control_get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                store_binding_id: string;
                session_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ControlView"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    lane_api_stores__store_binding_id__sessions__session_id__lane_get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                store_binding_id: string;
                session_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["LaneView"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    messages_api_stores__store_binding_id__sessions__session_id__messages_get: {
        parameters: {
            query?: {
                start?: number;
                limit?: number;
            };
            header?: never;
            path: {
                store_binding_id: string;
                session_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MessagePage"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    runs_api_stores__store_binding_id__sessions__session_id__runs_get: {
        parameters: {
            query?: {
                after?: string | null;
                limit?: number;
            };
            header?: never;
            path: {
                store_binding_id: string;
                session_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Page_RunSnapshot_"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    run_api_stores__store_binding_id__runs__run_id__snapshot_get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                store_binding_id: string;
                run_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["RunView"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    events_api_stores__store_binding_id__runs__run_id__events_get: {
        parameters: {
            query?: {
                after_sequence?: number;
                limit?: number;
            };
            header?: never;
            path: {
                store_binding_id: string;
                run_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["EventsPage"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    children_api_stores__store_binding_id__runs__run_id__children_get: {
        parameters: {
            query?: {
                after?: string | null;
                limit?: number;
            };
            header?: never;
            path: {
                store_binding_id: string;
                run_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Page_ChildRunSummary_"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    inputs_api_stores__store_binding_id__sessions__session_id__inputs_post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                store_binding_id: string;
                session_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["SubmitInput"];
            };
        };
        responses: {
            /** @description Successful Response */
            202: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SubmissionAccepted"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    respond_api_stores__store_binding_id__sessions__session_id__interactions__interaction_id__response_post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                store_binding_id: string;
                session_id: string;
                interaction_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["InteractionInput"];
            };
        };
        responses: {
            /** @description Successful Response */
            202: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResumeAccepted"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    interrupt_api_stores__store_binding_id__sessions__session_id__interrupt_post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                store_binding_id: string;
                session_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["InterruptInput"];
            };
        };
        responses: {
            /** @description Successful Response */
            202: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["InterruptAccepted"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    attach_api_stores__store_binding_id__sessions__session_id__attach_post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                store_binding_id: string;
                session_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AttachInput"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AttachResult"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    restore_api_stores__store_binding_id__sessions__session_id__restore_post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                store_binding_id: string;
                session_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["RestoreInput"];
            };
        };
        responses: {
            /** @description Successful Response */
            202: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["RestoreAccepted"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    fork_points_api_stores__store_binding_id__sessions__session_id__fork_points_get: {
        parameters: {
            query?: {
                after?: string | null;
                limit?: number;
            };
            header?: never;
            path: {
                store_binding_id: string;
                session_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Page_ForkPoint_"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    history_api_stores__store_binding_id__runs__run_id__history_get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                store_binding_id: string;
                run_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["RunHistory"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    fork_api_stores__store_binding_id__runs__run_id__fork_post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                store_binding_id: string;
                run_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateSessionInput"];
            };
        };
        responses: {
            /** @description Successful Response */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SessionView"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    session_stream_api_stores__store_binding_id__sessions__session_id__stream_get: {
        parameters: {
            query?: {
                cursor?: string | null;
            };
            header?: {
                "last-event-id"?: string | null;
            };
            path: {
                store_binding_id: string;
                session_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    resource_stream_api_resources__resource_id__stream_get: {
        parameters: {
            query?: {
                cursor?: string | null;
            };
            header?: {
                "last-event-id"?: string | null;
            };
            path: {
                resource_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    upload_image_api_stores__store_binding_id__sessions__session_id__media_images_post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                store_binding_id: string;
                session_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "multipart/form-data": components["schemas"]["Body_upload_image_api_stores__store_binding_id__sessions__session_id__media_images_post"];
            };
        };
        responses: {
            /** @description Successful Response */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MediaView"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    read_image_api_stores__store_binding_id__sessions__session_id__media__media_id___variant__get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                store_binding_id: string;
                session_id: string;
                media_id: string;
                variant: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    read_tool_api_stores__store_binding_id__runs__run_id__tools__tool_call_id__get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                store_binding_id: string;
                run_id: string;
                tool_call_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["UiToolCall"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    read_artifact_api_stores__store_binding_id__runs__run_id__tools__tool_call_id__artifact_get: {
        parameters: {
            query?: {
                download?: boolean;
            };
            header?: never;
            path: {
                store_binding_id: string;
                run_id: string;
                tool_call_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    read_tool_text_api_stores__store_binding_id__runs__run_id__tools__tool_call_id__text_get: {
        parameters: {
            query?: {
                offset?: number;
                limit?: number;
            };
            header?: never;
            path: {
                store_binding_id: string;
                run_id: string;
                tool_call_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["TextSlice"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    read_file_change_api_stores__store_binding_id__runs__run_id__tools__tool_call_id__file_change_get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                store_binding_id: string;
                run_id: string;
                tool_call_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Observation_FileChange_"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    goal_view_api_stores__store_binding_id__sessions__session_id__goal_get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                store_binding_id: string;
                session_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Observation_GoalView_"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    goal_create_api_stores__store_binding_id__sessions__session_id__goal_create_post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                store_binding_id: string;
                session_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["GoalCreateBody"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GoalReply"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    goal_edit_api_stores__store_binding_id__sessions__session_id__goal_edit_post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                store_binding_id: string;
                session_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["GoalEditBody"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GoalReply"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    goal_pause_api_stores__store_binding_id__sessions__session_id__goal_pause_post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                store_binding_id: string;
                session_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["GoalReasonBody"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GoalReply"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    goal_complete_api_stores__store_binding_id__sessions__session_id__goal_complete_post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                store_binding_id: string;
                session_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["GoalReasonBody"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GoalReply"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    goal_resume_api_stores__store_binding_id__sessions__session_id__goal_resume_post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                store_binding_id: string;
                session_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["GoalResumeBody"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GoalReply"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    goal_clear_api_stores__store_binding_id__sessions__session_id__goal_clear_post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                store_binding_id: string;
                session_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["RequestBody"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GoalReply"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    todo_view_api_stores__store_binding_id__sessions__session_id__todo_get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                store_binding_id: string;
                session_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Observation_TodoSnapshot_"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    todo_edit_api_stores__store_binding_id__sessions__session_id__todo_put: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                store_binding_id: string;
                session_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["TodoEditBody"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["TodoDocument"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    todo_document_api_stores__store_binding_id__sessions__session_id__todo_document_get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                store_binding_id: string;
                session_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Observation_TodoDocument_"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    generation_resources_api_generations__generation_id__resources_get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                generation_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResourcesView"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    maintenance_view_api_resources__resource_id__maintenance_get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                resource_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MaintenanceView"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    request_memory_cycle_api_resources__resource_id__maintenance_memory_cycle_post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                resource_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["RequestBody"];
            };
        };
        responses: {
            /** @description Successful Response */
            202: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["OperationAccepted"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    request_experience_api_resources__resource_id__maintenance_experience_post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                resource_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["RequestBody"];
            };
        };
        responses: {
            /** @description Successful Response */
            202: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["OperationAccepted"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    request_revision_api_resources__resource_id__maintenance_revision_post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                resource_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["RevisionBody"];
            };
        };
        responses: {
            /** @description Successful Response */
            202: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["OperationAccepted"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    memory_generation_api_resources__resource_id__memory_generation_get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                resource_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GenerationState"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    memory_items_api_resources__resource_id__memory_items_get: {
        parameters: {
            query?: {
                limit?: number;
                categories?: components["schemas"]["MemoryCategory"][] | null;
                kinds?: components["schemas"]["MemoryItemKind"][] | null;
            };
            header?: never;
            path: {
                resource_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Items_MemoryItem_"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    memory_item_api_resources__resource_id__memory_items__item_id__get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                resource_id: string;
                item_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MemoryItem"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    memory_events_api_resources__resource_id__memory_events_get: {
        parameters: {
            query?: {
                item_id?: string | null;
                limit?: number;
            };
            header?: never;
            path: {
                resource_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Items_MemoryEvent_"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    memory_overviews_api_resources__resource_id__memory_overviews_get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                resource_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Items_MemoryOverviewDocument_"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    memory_episodes_api_resources__resource_id__memory_episodes_get: {
        parameters: {
            query?: {
                after?: string | null;
                limit?: number;
            };
            header?: never;
            path: {
                resource_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Page_MemoryEpisode_"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    memory_episode_api_resources__resource_id__memory_episodes__episode_id__get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                resource_id: string;
                episode_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MemoryEpisode"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    memory_observations_api_resources__resource_id__memory_observations_get: {
        parameters: {
            query?: {
                status?: string | null;
                limit?: number;
            };
            header?: never;
            path: {
                resource_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Items_ObservationState_"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    memory_observation_api_resources__resource_id__memory_observations__observation_id__get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                resource_id: string;
                observation_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ObservationState"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    memory_generation_results_api_resources__resource_id__memory_generation_results_get: {
        parameters: {
            query?: {
                after?: string | null;
                limit?: number;
            };
            header?: never;
            path: {
                resource_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Page_GenerationResult_"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    memory_publications_api_resources__resource_id__memory_publications_get: {
        parameters: {
            query?: {
                after?: string | null;
                limit?: number;
            };
            header?: never;
            path: {
                resource_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Page_MemoryPublicationRecord_"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    memory_publication_api_resources__resource_id__memory_publications__publication_id__get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                resource_id: string;
                publication_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MemoryPublicationRecord"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    evolution_sources_api_resources__resource_id__evolution_sources_get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                resource_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["EvolutionSources"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    evolution_skill_api_resources__resource_id__evolution_skill_get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                resource_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Observation_SkillDocument_"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    evolution_requests_api_resources__resource_id__evolution_requests_get: {
        parameters: {
            query?: {
                after?: string | null;
                limit?: number;
            };
            header?: never;
            path: {
                resource_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Page_RevisionRequestSummary_"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    evolution_request_api_resources__resource_id__evolution_requests__revision_id__get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                resource_id: string;
                revision_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["RevisionItem"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    evolution_result_api_resources__resource_id__evolution_revisions__revision_id__result_get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                resource_id: string;
                revision_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Observation_EvolutionResult_"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    evolution_publications_api_resources__resource_id__evolution_publications_get: {
        parameters: {
            query?: {
                after?: string | null;
                limit?: number;
            };
            header?: never;
            path: {
                resource_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Page_PublicationSummary_"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    evolution_publication_api_resources__resource_id__evolution_publications__publication_id__get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                resource_id: string;
                publication_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PublicationHistoryEntry"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    preparations_api_stores__store_binding_id__runs__run_id__preparations_get: {
        parameters: {
            query?: {
                after?: string | null;
                limit?: number;
            };
            header?: never;
            path: {
                store_binding_id: string;
                run_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Page_ContextPreparationSummary_"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    preparation_api_stores__store_binding_id__preparations__preparation_id__get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                store_binding_id: string;
                preparation_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Observation_ContextPreparation_"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    configuration_adoptions_api_stores__store_binding_id__runs__run_id__configuration_adoptions_get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                store_binding_id: string;
                run_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["EvidenceItems_ConfigurationApplied_"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    configuration_snapshot_api_configuration_snapshots__configuration_snapshot_id__get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                configuration_snapshot_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["EffectiveConfiguration"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    source_adoptions_api_stores__store_binding_id__runs__run_id__source_adoptions_get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                store_binding_id: string;
                run_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["EvidenceItems_SourceAdopted_"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    model_streams_api_stores__store_binding_id__runs__run_id__model_streams_get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                store_binding_id: string;
                run_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["EvidenceItems_ModelStreamLink_"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    model_calls_api_evidence_model_calls_get: {
        parameters: {
            query?: {
                store_binding_id?: string | null;
                run_id?: string | null;
                resource_id?: string | null;
                cycle_id?: string | null;
                after?: string | null;
                limit?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Page_ModelCallSummary_"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    model_call_api_evidence_model_calls__record_id__get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                record_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ModelCallRecord"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    resource_adoptions_api_resources__resource_id__source_adoptions_get: {
        parameters: {
            query?: {
                after?: string | null;
                publication_id?: string | null;
                limit?: number;
            };
            header?: never;
            path: {
                resource_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Page_SourceAdopted_"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    evidence_status_api_evidence_status_get: {
        parameters: {
            query?: {
                store_binding_id?: string | null;
                run_id?: string | null;
                resource_id?: string | null;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["EvidenceStatus"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    request_export_api_showcases_export_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ExportInput"];
            };
        };
        responses: {
            /** @description Successful Response */
            202: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["OperationAccepted"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    request_import_api_showcases_import_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "multipart/form-data": components["schemas"]["Body_request_import_api_showcases_import_post"];
            };
        };
        responses: {
            /** @description Successful Response */
            202: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["OperationAccepted"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    list_showcases_api_showcases_get: {
        parameters: {
            query?: {
                after?: string | null;
                limit?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Page_ShowcaseView_"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    showcase_api_showcases__showcase_id__get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                showcase_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ShowcaseView"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    manifest_api_showcases__showcase_id__manifest_get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                showcase_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    record_api_showcases__showcase_id__record_get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                showcase_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ShowcaseRecord"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    download_api_showcases__showcase_id__download_get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                showcase_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    asset_api_showcases__showcase_id__assets__asset_id__get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                showcase_id: string;
                asset_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    view_api_showcases__showcase_id__view_get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                showcase_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "text/html": string;
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    viewer_script_api_showcases__showcase_id__viewer_js_get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                showcase_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    viewer_style_api_showcases__showcase_id__viewer_css_get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                showcase_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
}
