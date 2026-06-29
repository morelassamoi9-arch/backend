import logging
import uuid
from datetime import datetime
from typing import Dict, Any, Literal

logger = logging.getLogger("e_citoyen_ci.security.sal")


class SecurityArbitrationEngine:
    """
    Security Arbitration Engine (SAE) - Security Authority Layer (SAL)
    Moteur déterministe de résolution des conflits et d'arbitrage de sécurité.
    """

    @staticmethod
    def calculate_risk_score(
        technical_criticality: float,  # 0.0 to 10.0 (CVSS equivalent)
        business_impact: float,        # 0.0 to 10.0 (Targeted resource impact)
        detection_confidence: float,   # 0.0 to 1.0 (Sensor precision)
        false_positive_prob: float      # 0.0 to 1.0 (False positive rate)
    ) -> float:
        """
        Calcule un score de risque global pondéré entre 0.0 et 100.0.
        Formule : Risk = (Technical_Criticality * 0.5 + Business_Impact * 0.5) * Detection_Confidence * (1.0 - False_Positive_Prob) * 10
        """
        base_severity = (technical_criticality * 0.5) + (business_impact * 0.5)
        adjusted_confidence = detection_confidence * (1.0 - false_positive_prob)
        risk_score = base_severity * adjusted_confidence * 10.0
        return min(100.0, max(0.0, risk_score))

    @classmethod
    def arbitrate(
        cls,
        sensor_inputs: Dict[str, Any],
        human_override: Literal["ALLOW", "BLOCK", None] = None
    ) -> Dict[str, Any]:
        """
        Arbitre de manière déterministe les entrées de sécurité.
        Retourne une décision unique : ALLOW, BLOCK ou ESCALATE.
        Toutes les décisions sont signées avec un identifiant de preuve (evidence_id).
        """
        evidence_id = str(uuid.uuid4())
        timestamp = datetime.utcnow().isoformat()

        # 1. Règle d'or de la SAL : L'override de l'OSSI prime sur les automatismes si configuré
        if human_override is not None:
            logger.warning(
                f"[SECURITY][SAL] Decision: {human_override} (Human Override) | "
                f"Evidence: {evidence_id} | Time: {timestamp} | OSSI Authorized"
            )
            return {
                "decision": human_override,
                "evidence_id": evidence_id,
                "timestamp": timestamp,
                "reason": "Forçage manuel par l'Officier de Sécurité des Systèmes d'Information (OSSI)",
                "risk_score": 0.0
            }

        # 2. Extraction des entrées capteurs
        waf_blocked = sensor_inputs.get("waf_blocked", False)
        siem_threat_level = sensor_inputs.get("siem_threat_level", "low")  # low, medium, high, critical
        ci_cd_failed = sensor_inputs.get("ci_cd_failed", False)

        # Si le build CI/CD a échoué, on bloque systématiquement le déploiement
        if ci_cd_failed:
            logger.error(
                f"[SECURITY][SAL] Decision: BLOCK | Evidence: {evidence_id} | "
                f"Reason: CI/CD Security Gates Failure"
            )
            return {
                "decision": "BLOCK",
                "evidence_id": evidence_id,
                "timestamp": timestamp,
                "reason": "Échec des barrières de sécurité CI/CD (Security Gates)",
                "risk_score": 100.0
            }

        # 3. Calcul du score de risque global
        tech_crit = 0.0
        if siem_threat_level == "critical":
            tech_crit = 10.0
        elif siem_threat_level == "high":
            tech_crit = 8.0
        elif siem_threat_level == "medium":
            tech_crit = 5.0
        else:
            tech_crit = 2.0

        bus_impact = sensor_inputs.get("business_impact", 5.0)
        det_conf = sensor_inputs.get("detection_confidence", 0.9)
        fp_prob = sensor_inputs.get("false_positive_probability", 0.1)

        risk_score = cls.calculate_risk_score(tech_crit, bus_impact, det_conf, fp_prob)

        # 4. Arbre de décision déterministe (Seuils SAL)
        decision = "ALLOW"
        reason = "Activité conforme aux seuils de confiance"

        if risk_score >= 70.0:
            decision = "BLOCK"
            reason = f"Alerte de risque critique ({risk_score:.1f}/100) détectée"
        elif risk_score >= 40.0:
            decision = "ESCALATE"
            reason = f"Activité suspecte nécessitant un arbitrage SOC ({risk_score:.1f}/100)"
        elif waf_blocked:
            if risk_score >= 30.0:
                decision = "BLOCK"
                reason = f"Blocage automatique WAF validé par score de risque ({risk_score:.1f}/100)"
            else:
                decision = "ESCALATE"
                reason = f"Blocage WAF avec score de risque faible ({risk_score:.1f}/100). Faux positif suspecté."

        logger.warning(
            f"[SECURITY][SAL] Decision: {decision} | Risk: {risk_score:.1f}/100 | "
            f"Evidence: {evidence_id} | Reason: {reason}"
        )

        return {
            "decision": decision,
            "evidence_id": evidence_id,
            "timestamp": timestamp,
            "reason": reason,
            "risk_score": risk_score
        }
