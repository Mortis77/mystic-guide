package ai.mysticguide

import android.annotation.SuppressLint
import android.app.DownloadManager
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.Environment
import android.webkit.JavascriptInterface
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.FileProvider
import androidx.webkit.WebViewAssetLoader
import java.io.File

/**
 * 薄壳：assets/www 里的 PWA 用 appassets 域提供，
 * 另外暴露 AndroidApp.installApk(url) 给前端做版本更新。
 */
class MainActivity : AppCompatActivity() {

    private lateinit var webView: WebView
    private var pendingApk: File? = null
    private var lastDownloadId = -1L

    private val downloadReceiver = object : BroadcastReceiver() {
        override fun onReceive(ctx: Context, intent: Intent) {
            val id = intent.getLongExtra(DownloadManager.EXTRA_DOWNLOAD_ID, -1)
            if (id == -1L || id != lastDownloadId) return
            val apk = pendingApk ?: return
            if (apk.exists()) installApk(apk)
        }
    }

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        webView = WebView(this)
        setContentView(webView)

        val assetLoader = WebViewAssetLoader.Builder()
            .addPathHandler("/assets/", WebViewAssetLoader.AssetsPathHandler(this))
            .build()

        webView.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            databaseEnabled = true
            allowFileAccess = false
            allowContentAccess = false
            mediaPlaybackRequiresUserGesture = false
        }

        webView.addJavascriptInterface(Bridge(), "AndroidApp")

        webView.webViewClient = object : WebViewClient() {
            override fun shouldInterceptRequest(
                view: WebView,
                request: WebResourceRequest
            ): WebResourceResponse? = assetLoader.shouldInterceptRequest(request.url)
        }

        webView.loadUrl("https://appassets.androidplatform.net/assets/www/index.html")

        registerReceiver(
            downloadReceiver,
            IntentFilter(DownloadManager.ACTION_DOWNLOAD_COMPLETE),
            if (Build.VERSION.SDK_INT >= 33) RECEIVER_EXPORTED else 0
        )
    }

    inner class Bridge {
        @JavascriptInterface
        fun installApk(url: String) {
            runOnUiThread { startDownload(url) }
        }

        @JavascriptInterface
        fun version(): String = BuildConfig.VERSION_NAME
    }

    private fun startDownload(url: String) {
        try {
            val dir = getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS)
            if (dir != null && !dir.exists()) dir.mkdirs()
            val req = DownloadManager.Request(Uri.parse(url))
                .setTitle("神秘指南更新")
                .setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED)
                .setDestinationInExternalFilesDir(this, Environment.DIRECTORY_DOWNLOADS, "mystic-guide-update.apk")
                .setMimeType("application/vnd.android.package-archive")
            val dm = getSystemService(Context.DOWNLOAD_SERVICE) as DownloadManager
            lastDownloadId = dm.enqueue(req)
            pendingApk = File(dir, "mystic-guide-update.apk")
            Toast.makeText(this, "正在下载更新…", Toast.LENGTH_SHORT).show()
        } catch (e: Exception) {
            Toast.makeText(this, "下载失败：${e.message}", Toast.LENGTH_LONG).show()
        }
    }

    private fun installApk(file: File) {
        try {
            val uri = FileProvider.getUriForFile(this, "$packageName.fileprovider", file)
            val intent = Intent(Intent.ACTION_VIEW).apply {
                setDataAndType(uri, "application/vnd.android.package-archive")
                addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION or Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            startActivity(intent)
        } catch (e: Exception) {
            Toast.makeText(this, "安装失败：${e.message}", Toast.LENGTH_LONG).show()
        }
    }

    @Deprecated("Deprecated in Java")
    override fun onBackPressed() {
        if (::webView.isInitialized && webView.canGoBack()) webView.goBack()
        else @Suppress("DEPRECATION") super.onBackPressed()
    }

    override fun onDestroy() {
        try { unregisterReceiver(downloadReceiver) } catch (_: Exception) {}
        super.onDestroy()
    }
}
