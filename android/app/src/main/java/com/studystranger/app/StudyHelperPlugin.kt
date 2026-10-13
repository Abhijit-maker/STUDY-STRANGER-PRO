package com.studystranger.app

import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.Manifest
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import android.os.Build
import android.os.BatteryManager
import android.os.Environment
import android.os.StatFs
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import android.widget.Toast
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin

@CapacitorPlugin(name = "StudyHelper")
class StudyHelperPlugin : Plugin() {

    private val PERMISSIONS_REQUEST_CODE = 1001

    @PluginMethod
    fun checkPermissionsStatus(call: PluginCall) {
        val hasCallPhone = ContextCompat.checkSelfPermission(context, Manifest.permission.CALL_PHONE) == PackageManager.PERMISSION_GRANTED
        val hasReadContacts = ContextCompat.checkSelfPermission(context, Manifest.permission.READ_CONTACTS) == PackageManager.PERMISSION_GRANTED

        val ret = JSObject()
        ret.put("callPhoneGranted", hasCallPhone)
        ret.put("readContactsGranted", hasReadContacts)
        ret.put("allGranted", hasCallPhone && hasReadContacts)
        call.resolve(ret)
    }

    @PluginMethod
    fun requestRuntimePermissions(call: PluginCall) {
        val permissionsToRequest = mutableListOf<String>()
        if (ContextCompat.checkSelfPermission(context, Manifest.permission.CALL_PHONE) != PackageManager.PERMISSION_GRANTED) {
            permissionsToRequest.add(Manifest.permission.CALL_PHONE)
        }
        if (ContextCompat.checkSelfPermission(context, Manifest.permission.READ_CONTACTS) != PackageManager.PERMISSION_GRANTED) {
            permissionsToRequest.add(Manifest.permission.READ_CONTACTS)
        }

        if (permissionsToRequest.isNotEmpty()) {
            ActivityCompat.requestPermissions(activity, permissionsToRequest.toTypedArray(), PERMISSIONS_REQUEST_CODE)
        }

        val ret = JSObject()
        ret.put("requested", true)
        call.resolve(ret)
    }

    @PluginMethod
    fun makeDirectCall(call: PluginCall) {
        val phoneNumber = call.getString("phoneNumber") ?: ""
        if (phoneNumber.isEmpty()) {
            call.reject("Phone number is required")
            return
        }

        val hasPermission = ContextCompat.checkSelfPermission(context, Manifest.permission.CALL_PHONE) == PackageManager.PERMISSION_GRANTED
        if (!hasPermission) {
            call.reject("PERMISSION_DENIED: CALL_PHONE permission not granted")
            return
        }

        try {
            // Intent.ACTION_CALL directly initiates the phone call
            val intent = Intent(Intent.ACTION_CALL, Uri.parse("tel:$phoneNumber"))
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            activity.startActivity(intent)

            val ret = JSObject()
            ret.put("success", true)
            ret.put("action", "ACTION_CALL")
            call.resolve(ret)
        } catch (e: Exception) {
            call.reject("Failed to make direct call: ${e.message}", e)
        }
    }

    @PluginMethod
    fun openDialPad(call: PluginCall) {
        val phoneNumber = call.getString("phoneNumber") ?: ""
        try {
            // Intent.ACTION_DIAL opens the phone dialer with the number pre-populated
            val intent = Intent(Intent.ACTION_DIAL, Uri.parse("tel:$phoneNumber"))
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            activity.startActivity(intent)

            val ret = JSObject()
            ret.put("success", true)
            ret.put("action", "ACTION_DIAL")
            call.resolve(ret)
        } catch (e: Exception) {
            call.reject("Failed to open dial pad: ${e.message}", e)
        }
    }

    @PluginMethod
    fun showToast(call: PluginCall) {
        val message = call.getString("message") ?: "Greetings from Study Stranger Native Core!"
        
        activity.runOnUiThread {
            Toast.makeText(context, message, Toast.LENGTH_SHORT).show()
        }
        
        val ret = JSObject()
        ret.put("success", true)
        call.resolve(ret)
    }

    @PluginMethod
    fun getDeviceStats(call: PluginCall) {
        val ret = JSObject()
        try {
            // Get Battery Percentage using Android SDK BatteryManager
            val batteryManager = context.getSystemService(Context.BATTERY_SERVICE) as BatteryManager
            val batteryLevel = batteryManager.getIntProperty(BatteryManager.BATTERY_PROPERTY_CAPACITY)
            ret.put("batteryLevel", batteryLevel)

            // Get Free Storage using Android SDK StatFs
            val path = Environment.getDataDirectory()
            val stat = StatFs(path.path)
            val blockSize = stat.blockSizeLong
            val availableBlocks = stat.availableBlocksLong
            val freeBytes = availableBlocks * blockSize
            val freeMegabytes = freeBytes / (1024 * 1024)
            ret.put("freeStorageMB", freeMegabytes)
            ret.put("isLowStorage", freeMegabytes < 500)
            
            call.resolve(ret)
        } catch (e: Exception) {
            ret.put("error", e.message)
            call.reject("Failed to retrieve device stats", e)
        }
    }

    @PluginMethod
    fun triggerHaptic(call: PluginCall) {
        val type = call.getString("type") ?: "success"
        val vibrator = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            val vibratorManager = context.getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as VibratorManager
            vibratorManager.defaultVibrator
        } else {
            @Suppress("DEPRECATION")
            context.getSystemService(Context.VIBRATOR_SERVICE) as Vibrator
        }

        try {
            if (vibrator.hasVibrator()) {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    when (type) {
                        "success" -> {
                            vibrator.vibrate(VibrationEffect.createOneShot(100, VibrationEffect.DEFAULT_AMPLITUDE))
                        }
                        "failure" -> {
                            val pattern = longArrayOf(0, 100, 100, 150)
                            val amplitudes = intArrayOf(0, VibrationEffect.DEFAULT_AMPLITUDE, 0, VibrationEffect.DEFAULT_AMPLITUDE)
                            vibrator.vibrate(VibrationEffect.createWaveform(pattern, amplitudes, -1))
                        }
                        "celebrate" -> {
                            val pattern = longArrayOf(0, 80, 80, 80, 80, 150)
                            val amplitudes = intArrayOf(0, VibrationEffect.DEFAULT_AMPLITUDE, 0, VibrationEffect.DEFAULT_AMPLITUDE, 0, VibrationEffect.DEFAULT_AMPLITUDE)
                            vibrator.vibrate(VibrationEffect.createWaveform(pattern, amplitudes, -1))
                        }
                        else -> {
                            vibrator.vibrate(VibrationEffect.createOneShot(50, VibrationEffect.DEFAULT_AMPLITUDE))
                        }
                    }
                } else {
                    @Suppress("DEPRECATION")
                    when (type) {
                        "success" -> vibrator.vibrate(100)
                        "failure" -> vibrator.vibrate(longArrayOf(0, 100, 100, 150), -1)
                        "celebrate" -> vibrator.vibrate(longArrayOf(0, 80, 80, 80, 80, 150), -1)
                        else -> vibrator.vibrate(50)
                    }
                }
            }
            val ret = JSObject()
            ret.put("vibrated", true)
            call.resolve(ret)
        } catch (e: Exception) {
            call.reject("Vibration failed", e)
        }
    }
}
